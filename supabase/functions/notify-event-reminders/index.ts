/**
 * notify-event-reminders
 *
 * Sends 24-hour event reminders to users who saved an upcoming event.
 * Schedule via pg_cron (runs every hour):
 *
 *   select cron.schedule(
 *     'event-reminders',
 *     '0 * * * *',
 *     $$
 *       select net.http_post(
 *         url := '{project_url}/functions/v1/notify-event-reminders',
 *         headers := '{"Authorization": "Bearer {service_role_key}"}'::jsonb
 *       );
 *     $$
 *   );
 *
 * Or call manually from the Supabase dashboard → Edge Functions → Invoke.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

async function sendExpoPush(messages: PushMessage[]) {
  if (messages.length === 0) return;
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

Deno.serve(async () => {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const windowEnd   = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  // Find published events starting in the 23-25h window
  const { data: upcomingEvents } = await supabase
    .from('announcements')
    .select('id, title, location, professional_id, professionals(business_name)')
    .eq('status', 'published')
    .gte('event_start', windowStart)
    .lte('event_start', windowEnd)
    .not('event_start', 'is', null);

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return new Response('no events', { status: 200 });
  }

  const announcementIds = upcomingEvents.map((e: { id: string }) => e.id);

  // Find users who saved any of these events
  const { data: savedRows } = await supabase
    .from('saved_announcements')
    .select('user_id, announcement_id')
    .in('announcement_id', announcementIds);

  if (!savedRows || savedRows.length === 0) {
    return new Response('no saved events', { status: 200 });
  }

  // Find already-sent reminders to avoid duplicates
  const { data: existingReminders } = await supabase
    .from('notifications')
    .select('user_id, announcement_id')
    .eq('type', 'event_reminder')
    .in('announcement_id', announcementIds);

  const alreadySent = new Set(
    (existingReminders ?? []).map(
      (r: { user_id: string; announcement_id: string }) => `${r.user_id}:${r.announcement_id}`,
    ),
  );

  // Build announcement lookup
  const eventMap = new Map(
    upcomingEvents.map((e: {
      id: string;
      title: string;
      location: string | null;
      professionals: { business_name: string } | null;
    }) => [e.id, e]),
  );

  // Collect notifications to insert + push tokens to fetch
  const notificationsToInsert: {
    user_id: string;
    type: string;
    title: string;
    subtitle: string;
    announcement_id: string;
  }[] = [];

  const userIdsForPush: string[] = [];

  for (const row of savedRows) {
    const key = `${row.user_id}:${row.announcement_id}`;
    if (alreadySent.has(key)) continue;

    const event = eventMap.get(row.announcement_id);
    if (!event) continue;

    const subtitle = event.location ?? (event.professionals as { business_name: string } | null)?.business_name ?? '';

    notificationsToInsert.push({
      user_id: row.user_id,
      type: 'event_reminder',
      title: `${event.title} is tomorrow`,
      subtitle,
      announcement_id: row.announcement_id,
    });
    userIdsForPush.push(row.user_id);
  }

  if (notificationsToInsert.length === 0) {
    return new Response('all already notified', { status: 200 });
  }

  await supabase.from('notifications').insert(notificationsToInsert);

  // Fetch push tokens and send
  const { data: tokenRows } = await supabase
    .from('push_tokens')
    .select('user_id, token')
    .in('user_id', userIdsForPush);

  const tokenMap = new Map<string, string>();
  for (const row of tokenRows ?? []) {
    tokenMap.set(row.user_id, row.token);
  }

  const pushMessages: PushMessage[] = notificationsToInsert
    .map((n) => {
      const token = tokenMap.get(n.user_id);
      if (!token) return null;
      return {
        to: token,
        title: n.title,
        body: n.subtitle,
        data: { announcementId: n.announcement_id, type: 'event_reminder' },
      };
    })
    .filter((m): m is PushMessage => m !== null);

  await sendExpoPush(pushMessages);

  return new Response(`sent ${notificationsToInsert.length} reminders`, { status: 200 });
});
