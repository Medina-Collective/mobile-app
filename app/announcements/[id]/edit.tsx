import { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@components/layout';
import { Text, Input, Button, BackButton } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import {
  announcementSchema,
  MAX_VISIBILITY_DAYS,
} from '@features/announcements/schemas/announcement.schema';
import {
  useGetAnnouncement,
  useUpdateAnnouncement,
  useCurrentProfessionalId,
} from '@features/announcements/hooks/useAnnouncement';
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

export default function EditAnnouncementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: announcement, isLoading, isError } = useGetAnnouncement(id);
  const { data: currentProfessionalId } = useCurrentProfessionalId();
  const { mutate: update, isPending } = useUpdateAnnouncement();

  // Tracks the existing remote cover URL separately from the form's local-file URI
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | undefined>(undefined);

  type DateMode = 'none' | 'event' | 'deadline';
  const [dateMode, setDateMode] = useState<DateMode>('none');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
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
  const announcementType = watch('type');

  // Pre-populate the form once the announcement data is available
  useEffect(() => {
    if (announcement === undefined) return;

    setExistingCoverUrl(announcement.coverImageUrl);

    let initialDateMode: DateMode = 'none';
    if (announcement.eventStart !== undefined) {
      initialDateMode = 'event';
    } else if (announcement.deadline !== undefined) {
      initialDateMode = 'deadline';
    }
    setDateMode(initialDateMode);

    const eventStart =
      announcement.eventStart === undefined ? undefined : new Date(announcement.eventStart);
    const eventEnd =
      announcement.eventEnd === undefined ? undefined : new Date(announcement.eventEnd);
    const deadline =
      announcement.deadline === undefined ? undefined : new Date(announcement.deadline);

    reset({
      type: announcement.type,
      title: announcement.title,
      description: announcement.description,
      coverImageUri: undefined, // local-pick only; existing URL tracked separately
      location: announcement.location,
      eventStart,
      eventEnd,
      deadline,
      externalUrl: announcement.externalUrl,
      visibilityStart: new Date(announcement.visibilityStart),
      visibilityEnd: new Date(announcement.visibilityEnd),
      audience: announcement.audience,
      participationEnabled: announcement.participationEnabled,
      maxCapacity: announcement.maxCapacity,
    });
  }, [announcement, reset]);

  const handleDateModeChange = useCallback(
    (mode: DateMode) => {
      setDateMode(mode);
      if (mode !== 'event') {
        setValue('eventStart', undefined);
        setValue('eventEnd', undefined);
      }
      if (mode !== 'deadline') {
        setValue('deadline', undefined);
      }
    },
    [setValue],
  );

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

  const removePhoto = useCallback(() => {
    setValue('coverImageUri', undefined);
    setExistingCoverUrl(undefined);
  }, [setValue]);

  const onSubmit = useCallback(
    (formData: AnnouncementFormData) => {
      update(
        { id, formData, ...(existingCoverUrl === undefined ? {} : { existingCoverUrl }) },
        {
          onSuccess: () => {
            router.back();
          },
          onError: (err) => {
            Alert.alert('Could not save changes', err.message);
          },
        },
      );
    },
    [update, id, existingCoverUrl, router],
  );

  // ── Loading / error states ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.burgundy.mid} />
        </View>
      </Screen>
    );
  }

  if (isError || announcement === undefined) {
    return (
      <Screen>
        <BackButton />
        <View style={styles.centered}>
          <Text style={styles.mutedText}>Could not load this announcement.</Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  // ── Creator guard ───────────────────────────────────────────────────────────

  if (
    user?.role !== USER_ROLES.PROFESSIONAL ||
    (currentProfessionalId !== undefined &&
      currentProfessionalId !== null &&
      currentProfessionalId !== announcement.professionalId)
  ) {
    return (
      <Screen>
        <BackButton />
        <View style={styles.centered}>
          <Text style={styles.mutedText}>You can only edit your own announcements.</Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const eventEnd = watch('eventEnd');
  const maxByWindow =
    visibilityStart === undefined
      ? undefined
      : new Date(visibilityStart.getTime() + MAX_VISIBILITY_DAYS * 24 * 60 * 60 * 1000);
  const maxVisibilityEnd =
    eventEnd !== undefined && maxByWindow !== undefined
      ? new Date(Math.min(eventEnd.getTime(), maxByWindow.getTime()))
      : (eventEnd ?? maxByWindow);

  const isLive = new Date() >= new Date(announcement.visibilityStart);

  const displayImageUri = coverImageUri ?? existingCoverUrl;

  return (
    <Screen>
      <View style={styles.navRow}>
        <BackButton />
        <Text style={styles.navTitle}>Edit Announcement</Text>
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
          <SectionHeader
            title="Cover Image"
            subtitle="Optional — a photo makes your post stand out."
          />
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {displayImageUri === undefined ? (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.warm.muted} />
                <Text variant="bodySm" style={styles.imagePlaceholderText}>
                  Tap to add a cover photo
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: displayImageUri }}
                style={styles.imagePreview}
                contentFit="cover"
              />
            )}
          </TouchableOpacity>
          {displayImageUri !== undefined && (
            <TouchableOpacity onPress={removePhoto} style={styles.removeImage}>
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

        {/* ── Date / Deadline ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Date"
            subtitle="Pick a type, or leave empty for timeless announcements."
          />
          <View style={styles.dateModeRow}>
            {(['none', 'event', 'deadline'] as const).map((mode) => {
              const eventOrDeadlineLabel = mode === 'event' ? 'Event Date' : 'Deadline';
              const modeLabel = mode === 'none' ? 'None' : eventOrDeadlineLabel;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.dateModeOption,
                    dateMode === mode && styles.dateModeOptionActive,
                  ]}
                  onPress={() => handleDateModeChange(mode)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dateModeLabel,
                      dateMode === mode && styles.dateModeLabelActive,
                    ]}
                  >
                    {modeLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {dateMode === 'event' && (
            <>
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
                    spinner
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
                    spinner
                    placeholder="No end date"
                  />
                )}
              />
            </>
          )}

          {dateMode === 'deadline' && (
            <Controller
              control={control}
              name="deadline"
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  label="Deadline"
                  value={value}
                  onChange={onChange}
                  error={errors.deadline?.message}
                  placeholder="Pick a deadline date"
                />
              )}
            />
          )}
        </View>

        {/* ── Link ──────────────────────────────────────────────────────────── */}
        {(announcementType === 'limited_offer' || announcementType === 'update') && (
          <View style={styles.section}>
            <SectionHeader
              title="Link"
              subtitle={
                announcementType === 'limited_offer'
                  ? 'Where should the "View Offer" button send people?'
                  : 'Where should the "Learn More" button send people?'
              }
            />
            <Controller
              control={control}
              name="externalUrl"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="URL"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.externalUrl?.message}
                  placeholder="https://..."
                  keyboardType="url"
                  autoCapitalize="none"
                />
              )}
            />
          </View>
        )}

        {/* ── Visibility Window ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Visibility Window *"
            subtitle={`When will this post appear on the feed? Maximum ${MAX_VISIBILITY_DAYS} days.`}
          />
          <Controller
            control={control}
            name="visibilityStart"
            render={({ field: { value, onChange } }) => (
              <DatePicker
                label="Show from *"
                value={value}
                onChange={onChange}
                error={errors.visibilityStart?.message}
                helperText={
                  isLive
                    ? 'Your post is live — start date cannot be changed'
                    : 'The day your announcement goes live on the feed'
                }
                disabled={isLive}
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
                  <Text
                    variant="label"
                    style={[styles.audienceLabel, value === 'public' && styles.audienceLabelActive]}
                  >
                    Everyone
                  </Text>
                  <Text variant="caption" style={styles.audienceHint}>
                    All members see this
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.audienceOption,
                    value === 'pro_only' && styles.audienceOptionActive,
                  ]}
                  onPress={() => onChange('pro_only')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={value === 'pro_only' ? colors.burgundy.mid : colors.warm.muted}
                    style={styles.audienceIcon}
                  />
                  <Text
                    variant="label"
                    style={[
                      styles.audienceLabel,
                      value === 'pro_only' && styles.audienceLabelActive,
                    ]}
                  >
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
        {announcementType !== 'limited_offer' && (
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
                    onChangeText={(t) =>
                      onChange(t.length > 0 ? Number.parseInt(t, 10) : undefined)
                    }
                    onBlur={onBlur}
                    error={errors.maxCapacity?.message}
                    keyboardType="number-pad"
                    placeholder="Leave blank for unlimited"
                  />
                )}
              />
            )}
          </View>
        )}

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <Button
          title="Save Changes"
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitBtn}
        />
      </ScrollView>
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
  navSpacer: { width: 40 },
  scroll: { paddingBottom: spacing[16] },
  section: { marginBottom: spacing[8] },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  mutedText: { fontSize: 15, color: colors.warm.muted, textAlign: 'center' },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing[2] },
  imagePicker: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.warm.border,
    borderStyle: 'dashed',
  },
  imagePreview: { width: '100%', height: 180 },
  imagePlaceholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.warm.surface,
  },
  imagePlaceholderText: { color: colors.warm.muted },
  removeImage: { alignSelf: 'flex-end', marginTop: spacing[2] },
  removeImageText: { color: colors.error[500] },
  dateModeRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  dateModeOption: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    alignItems: 'center',
  },
  dateModeOptionActive: { backgroundColor: '#2F0A0A', borderColor: '#2F0A0A' },
  dateModeLabel: { fontFamily: fontFamily.sansMedium, fontSize: 13, color: colors.warm.title },
  dateModeLabelActive: { color: '#ffffff' },
  audienceRow: { flexDirection: 'row', gap: spacing[3] },
  audienceOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 20,
    padding: spacing[4],
    gap: spacing[1],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 252, 249, 0.88)',
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  audienceOptionActive: {
    borderColor: colors.burgundy.mid,
    backgroundColor: 'rgba(68, 0, 7, 0.06)',
  },
  audienceIcon: { marginBottom: spacing[1] },
  audienceLabel: { fontSize: 13, fontWeight: '600', color: colors.warm.body, textAlign: 'center' },
  audienceLabelActive: { color: colors.burgundy.mid },
  audienceHint: { fontSize: 11, color: colors.warm.muted, textAlign: 'center' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  toggleInfo: { flex: 1, gap: spacing[1] },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: colors.warm.title },
  toggleHint: { fontSize: 11, color: colors.warm.muted },
  submitBtn: { marginTop: spacing[4] },
});
