/**
 * notify-new-announcement
 *
 * Called via a Supabase Database Webhook on INSERT to announcements
 * where status = 'published'.
 *
 * Set up in the Supabase dashboard:
 *   Database → Webhooks → Create new webhook
 *   Table: announcements | Events: INSERT
 *   URL: {project_url}/functions/v1/notify-new-announcement
 *   HTTP headers: Authorization: Bearer {service_role_key}
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const INTEREST_SAVE_THRESHOLD = 3;   // saves of same type to qualify
const INTEREST_COOLDOWN_DAYS  = 7;   // max one interest notification per type per week

type AnnouncementType = 'activity_event' | 'bazaar' | 'brand_popup' | 'halaqa' | 'limited_offer' | 'other';

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    professional_id: string;
    type: AnnouncementType;
    title: string;
    location: string | null;
    status: string;
    event_start: string | null;
  };
}

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

async function sendExpoPush(messages: PushMessage[]) {
  if (messages.length === 0) return;
  // Expo accepts max 100 per request — chunk if needed
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }
  await Promise.all(
    chunks.map((chunk) =>
      fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      }),
    ),
  );
}

async function getPushTokens(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from('push_tokens')
    .select('user_id, token')
    .in('user_id', userIds);
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.user_id, row.token);
  }
  return map;
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const announcement = payload.record;

  // Only process published announcements
  if (announcement.status !== 'published') {
    return new Response('skipped', { status: 200 });
  }

  // ── Get professional info ────────────────────────────────────────────────
  const { data: professional } = await supabase
    .from('professionals')
    .select('business_name')
    .eq('id', announcement.professional_id)
    .single();

  const businessName = professional?.business_name ?? 'Someone you follow';
  const isOffer = announcement.type === 'limited_offer';
  const notifType = isOffer ? 'offer' : 'community';
  const notifTitle = isOffer
    ? `New offer from ${businessName}`
    : `${businessName} posted something new`;
  const notifSubtitle = announcement.title;

  // ── Follow-based notifications ───────────────────────────────────────────
  const { data: followers } = await supabase
    .from('followers')
    .select('user_id')
    .eq('professional_id', announcement.professional_id);

  const followerIds = (followers ?? []).map((f: { user_id: string }) => f.user_id);

  if (followerIds.length > 0) {
    const followerNotifications = followerIds.map((userId: string) => ({
      user_id: userId,
      type: notifType,
      title: notifTitle,
      subtitle: notifSubtitle,
      announcement_id: announcement.id,
    }));

    await supabase.from('notifications').insert(followerNotifications);

    const tokenMap = await getPushTokens(followerIds);
    const pushMessages: PushMessage[] = [];
    for (const userId of followerIds) {
      const token = tokenMap.get(userId);
      if (token) {
        pushMessages.push({
          to: token,
          title: notifTitle,
          body: notifSubtitle,
          data: { announcementId: announcement.id, type: notifType },
        });
      }
    }
    await sendExpoPush(pushMessages);
  }

  // ── Interest-based notifications ─────────────────────────────────────────
  // Find users who saved 3+ announcements of this type but don't follow this professional
  const followerSet = new Set(followerIds);

  const { data: interestedRows } = await supabase
    .from('saved_announcements')
    .select('user_id, announcements!inner(type)')
    .eq('announcements.type', announcement.type);

  // Count saves per user for this type
  const saveCount = new Map<string, number>();
  for (const row of interestedRows ?? []) {
    const uid = row.user_id;
    saveCount.set(uid, (saveCount.get(uid) ?? 0) + 1);
  }

  const candidates = [...saveCount.entries()]
    .filter(([uid, count]) => count >= INTEREST_SAVE_THRESHOLD && !followerSet.has(uid))
    .map(([uid]) => uid);

  if (candidates.length > 0) {
    // Rate-limit: exclude users who already got an interest notification for this type recently
    const cutoff = new Date(Date.now() - INTEREST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentNotifs } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('type', 'announcement')
      .in('user_id', candidates)
      .gte('created_at', cutoff);

    const recentlyNotified = new Set((recentNotifs ?? []).map((n: { user_id: string }) => n.user_id));
    const eligible = candidates.filter((uid) => !recentlyNotified.has(uid));

    if (eligible.length > 0) {
      const interestTitle = 'You might be interested';
      const interestSubtitle = `${announcement.title} — ${businessName}`;

      await supabase.from('notifications').insert(
        eligible.map((userId) => ({
          user_id: userId,
          type: 'announcement',
          title: interestTitle,
          subtitle: interestSubtitle,
          announcement_id: announcement.id,
        })),
      );

      const tokenMap = await getPushTokens(eligible);
      const pushMessages: PushMessage[] = [];
      for (const userId of eligible) {
        const token = tokenMap.get(userId);
        if (token) {
          pushMessages.push({
            to: token,
            title: interestTitle,
            body: interestSubtitle,
            data: { announcementId: announcement.id, type: 'announcement' },
          });
        }
      }
      await sendExpoPush(pushMessages);
    }
  }

  return new Response('ok', { status: 200 });
});
