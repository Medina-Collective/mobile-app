import { useCallback } from 'react';
import {
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@components/layout';
import { Text, Input, Button, BackButton } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import { announcementSchema, MAX_VISIBILITY_DAYS } from '@features/announcements/schemas/announcement.schema';
import { useCreateAnnouncement } from '@features/announcements/hooks/useAnnouncement';
import { AnnouncementTypeSelector } from '@features/announcements/components/AnnouncementTypeSelector';
import { DatePicker } from '@features/announcements/components/DatePicker';
import type { AnnouncementFormData } from '@features/announcements/schemas/announcement.schema';

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <View style={sectionStyles.wrapper}>
      <Text variant="label" style={sectionStyles.title}>
        {title}
      </Text>
      {subtitle !== undefined && (
        <Text variant="caption" style={sectionStyles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing[3] },
  title: {
    color: colors.burgundy.mid,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  subtitle: { color: colors.warm.muted, marginTop: spacing[1], lineHeight: 18 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { mutate: create, isPending } = useCreateAnnouncement();

  // All hooks must be called unconditionally before any early return
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      audience: 'public',
      participationEnabled: false,
    },
  });

  const coverImageUri = watch('coverImageUri');
  const participationEnabled = watch('participationEnabled');
  const visibilityStart = watch('visibilityStart');

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled) return;
    if (result.assets[0] !== undefined) {
      setValue('coverImageUri', result.assets[0].uri);
    }
  }, [setValue]);

  const onSubmit = useCallback(
    (data: AnnouncementFormData) => {
      create(data, {
        onSuccess: (announcement) => {
          router.replace(`/announcements/${announcement.id}`);
        },
        onError: (err) => {
          Alert.alert('Could not publish', err.message);
        },
      });
    },
    [create, router],
  );

  // Guard: PRO only — after all hooks
  if (user?.role === USER_ROLES.PROFESSIONAL) {
    const maxVisibilityEnd =
      visibilityStart !== undefined
        ? new Date(visibilityStart.getTime() + MAX_VISIBILITY_DAYS * 24 * 60 * 60 * 1000)
        : undefined;

    return (
      <Screen>
        <View style={styles.navRow}>
          <BackButton />
          <Text style={styles.navTitle}>New Announcement</Text>
          <View style={styles.navSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Type ──────────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Type" subtitle="What kind of announcement is this?" />
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <AnnouncementTypeSelector
                  value={value}
                  onChange={onChange}
                  error={errors.type?.message}
                />
              )}
            />
          </View>

          {/* ── Details ───────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Details" />
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Title *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  placeholder="e.g. Ramadan Bazaar 2026"
                  maxLength={80}
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Description"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  placeholder="Tell people what to expect…"
                  multiline
                  numberOfLines={4}
                  style={styles.multiline}
                  maxLength={500}
                />
              )}
            />
          </View>

          {/* ── Cover Image ───────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Cover Image" subtitle="Optional — a photo makes your post stand out." />
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
              {coverImageUri === undefined ? (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color={colors.warm.muted} />
                  <Text variant="bodySm" style={styles.imagePlaceholderText}>
                    Tap to add a cover photo
                  </Text>
                </View>
              ) : (
                <Image source={{ uri: coverImageUri }} style={styles.imagePreview} contentFit="cover" />
              )}
            </TouchableOpacity>
            {coverImageUri !== undefined && (
              <TouchableOpacity onPress={() => setValue('coverImageUri', undefined)} style={styles.removeImage}>
                <Text variant="caption" style={styles.removeImageText}>
                  Remove photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Location ──────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Location" subtitle="Optional — where is this taking place?" />
            <Controller
              control={control}
              name="location"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Location"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.location?.message}
                  placeholder="e.g. Salle communautaire, Laval"
                />
              )}
            />
          </View>

          {/* ── Event Dates ───────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader
              title="Event Dates"
              subtitle="When does this actually happen? Leave blank if there's no fixed date — like an ongoing offer."
            />
            <Controller
              control={control}
              name="eventStart"
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  label="Event Start"
                  value={value}
                  onChange={onChange}
                  error={errors.eventStart?.message}
                  placeholder="No start date"
                />
              )}
            />
            <Controller
              control={control}
              name="eventEnd"
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  label="Event End"
                  value={value}
                  onChange={onChange}
                  minimumDate={watch('eventStart')}
                  error={errors.eventEnd?.message}
                  placeholder="No end date"
                />
              )}
            />
          </View>

          {/* ── Visibility Window ─────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader
              title="Visibility Window *"
              subtitle={`When will this post appear on the feed? It will be automatically hidden after the end date. Maximum ${MAX_VISIBILITY_DAYS} days.`}
            />
            <Controller
              control={control}
              name="visibilityStart"
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  label="Show from *"
                  value={value}
                  onChange={onChange}
                  minimumDate={new Date()}
                  error={errors.visibilityStart?.message}
                  helperText="The day your announcement goes live on the feed"
                />
              )}
            />
            <Controller
              control={control}
              name="visibilityEnd"
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  label="Hide after *"
                  value={value}
                  onChange={onChange}
                  minimumDate={visibilityStart ?? new Date()}
                  maximumDate={maxVisibilityEnd}
                  error={errors.visibilityEnd?.message}
                  helperText={`Max ${MAX_VISIBILITY_DAYS} days after the start date`}
                />
              )}
            />
          </View>

          {/* ── Audience ──────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader
              title="Audience"
              subtitle="Choose who can see this announcement on the feed."
            />
            <Controller
              control={control}
              name="audience"
              render={({ field: { value, onChange } }) => (
                <View style={styles.audienceRow}>
                  <TouchableOpacity
                    style={[styles.audienceOption, value === 'public' && styles.audienceOptionActive]}
                    onPress={() => onChange('public')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="earth-outline"
                      size={24}
                      color={value === 'public' ? colors.burgundy.mid : colors.warm.muted}
                      style={styles.audienceIcon}
                    />
                    <Text variant="label" style={[styles.audienceLabel, value === 'public' && styles.audienceLabelActive]}>
                      Everyone
                    </Text>
                    <Text variant="caption" style={styles.audienceHint}>
                      All members see this
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.audienceOption, value === 'pro_only' && styles.audienceOptionActive]}
                    onPress={() => onChange('pro_only')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="people-outline"
                      size={24}
                      color={value === 'pro_only' ? colors.burgundy.mid : colors.warm.muted}
                      style={styles.audienceIcon}
                    />
                    <Text variant="label" style={[styles.audienceLabel, value === 'pro_only' && styles.audienceLabelActive]}>
                      PROs only
                    </Text>
                    <Text variant="caption" style={styles.audienceHint}>
                      Only professional accounts
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          {/* ── Participation ─────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader
              title="Participation"
              subtitle="Let members confirm they're coming. They'll see a button on your post."
            />
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Enable participation button</Text>
                <Text style={styles.toggleHint}>
                  Members can tap "Confirm Participation" on your post
                </Text>
              </View>
              <Controller
                control={control}
                name="participationEnabled"
                render={({ field: { value, onChange } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: colors.warm.border, true: colors.burgundy.mid }}
                    thumbColor={colors.warm.elevated}
                  />
                )}
              />
            </View>

            {participationEnabled && (
              <Controller
                control={control}
                name="maxCapacity"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Max Capacity (optional)"
                    value={value === undefined ? '' : String(value)}
                    onChangeText={(t) => onChange(t.length > 0 ? Number.parseInt(t, 10) : undefined)}
                    onBlur={onBlur}
                    error={errors.maxCapacity?.message}
                    keyboardType="number-pad"
                    placeholder="Leave blank for unlimited"
                  />
                )}
              />
            )}
          </View>

          {/* ── Submit ────────────────────────────────────────────────────────── */}
          <Button
            title="Publish Announcement"
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitBtn}
          />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.centered}>
        <Text style={styles.gatedText}>
          Only professional accounts can create announcements.
        </Text>
        <Button title="Go Back" variant="outline" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.warm.title,
  },
  navSpacer: {
    width: 40,
  },
  scroll: {
    paddingBottom: spacing[16],
  },
  section: {
    marginBottom: spacing[8],
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing[2],
  },
  imagePicker: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.warm.border,
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.warm.surface,
  },
  imagePlaceholderText: {
    color: colors.warm.muted,
  },
  removeImage: {
    alignSelf: 'flex-end',
    marginTop: spacing[2],
  },
  removeImageText: {
    color: colors.error[500],
  },
  audienceRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  audienceOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.warm.border,
    borderRadius: 16,
    padding: spacing[4],
    gap: spacing[1],
    alignItems: 'center',
    backgroundColor: colors.warm.surface,
  },
  audienceOptionActive: {
    borderColor: colors.burgundy.mid,
    backgroundColor: 'rgba(68, 0, 7, 0.06)',
  },
  audienceIcon: {
    marginBottom: spacing[1],
  },
  audienceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warm.body,
    textAlign: 'center',
  },
  audienceLabelActive: {
    color: colors.burgundy.mid,
  },
  audienceHint: {
    fontSize: 11,
    color: colors.warm.muted,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  toggleInfo: {
    flex: 1,
    gap: spacing[1],
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.warm.title,
  },
  toggleHint: {
    fontSize: 11,
    color: colors.warm.muted,
  },
  submitBtn: {
    marginTop: spacing[4],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  gatedText: {
    fontSize: 15,
    color: colors.warm.muted,
    textAlign: 'center',
  },
});
