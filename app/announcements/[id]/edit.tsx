import { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
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
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import {
  announcementSchema,
  ANNOUNCEMENT_FORM_TYPES,
  ANNOUNCEMENT_CATEGORIES,
  MAX_VISIBILITY_DAYS,
} from '@features/announcements/schemas/announcement.schema';
import {
  useGetAnnouncement,
  useUpdateAnnouncement,
  useCurrentProfessionalId,
  fromDbType,
} from '@features/announcements/hooks/useAnnouncement';
import { DatePicker } from '@features/announcements/components/DatePicker';
import { TimePicker } from '@features/announcements/components/TimePicker';
import { LocationAutocomplete } from '@features/announcements/components/LocationAutocomplete';
import type { AnnouncementFormData } from '@features/announcements/schemas/announcement.schema';

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { girlsOnly: false, isFree: true },
  });

  const coverImageUri = watch('coverImageUri');
  const selectedType = watch('type');
  const isFree = watch('isFree');
  const description = watch('description') ?? '';
  const visibilityStart = watch('visibilityStart');
  const maxVisibilityEnd =
    visibilityStart === undefined
      ? undefined
      : new Date(visibilityStart.getTime() + MAX_VISIBILITY_DAYS * 24 * 60 * 60 * 1000);

  // Pre-populate the form once the announcement data is available
  useEffect(() => {
    if (announcement === undefined) return;

    setExistingCoverUrl(announcement.coverImageUrl);

    const eventStartDate =
      announcement.eventStart === undefined ? undefined : new Date(announcement.eventStart);

    reset({
      type: fromDbType(announcement.type),
      title: announcement.title,
      description: announcement.description,
      category: '', // no DB column — starts empty on edit
      coverImageUri: undefined, // local-pick only; existing URL tracked separately
      location: announcement.location,
      eventDate: eventStartDate,
      eventTime: eventStartDate, // TimePicker reads hours/minutes from this
      girlsOnly: false,
      isFree: true,
      visibilityStart: new Date(announcement.visibilityStart),
      visibilityEnd: new Date(announcement.visibilityEnd),
    });
  }, [announcement, reset]);

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

  const isLive = new Date() >= new Date(announcement.visibilityStart);
  const displayImageUri = coverImageUri ?? existingCoverUrl;

  return (
    <Screen>
      <View style={styles.flex}>
        <View style={styles.navRow}>
          <BackButton />
          <Text style={styles.navTitle}>Edit Announcement</Text>
          <View style={styles.navSpacer} />
        </View>

        {isLive && (
          <View style={styles.liveBanner}>
            <Ionicons name="radio-outline" size={14} color={colors.burgundy.mid} />
            <Text style={styles.liveBannerText}>This post is live on the feed</Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="always"
        >
          {/* ── Type ──────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Type</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <View style={styles.typeGrid}>
                  {ANNOUNCEMENT_FORM_TYPES.map((pt) => (
                    <TouchableOpacity
                      key={pt.value}
                      style={[styles.typeCard, value === pt.value && styles.typeCardActive]}
                      onPress={() => onChange(pt.value)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={pt.icon as never}
                        size={22}
                        color={value === pt.value ? colors.burgundy.mid : colors.warm.muted}
                        style={styles.typeIcon}
                      />
                      <Text
                        style={[styles.typeLabel, value === pt.value && styles.typeLabelActive]}
                      >
                        {pt.label}
                      </Text>
                      <Text style={styles.typeDesc}>{pt.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* ── Cover Image ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Cover Image</Text>
            {displayImageUri === undefined ? (
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
                <Ionicons name="image-outline" size={28} color={colors.warm.muted} />
                <Text style={styles.imagePickerText}>Tap to upload</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: displayImageUri }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <TouchableOpacity style={styles.removeImageBtn} onPress={removePhoto}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Title ─────────────────────────────────────────────────────── */}
          <View style={styles.section}>
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
                  placeholder="Give your announcement a title"
                  maxLength={100}
                />
              )}
            />
          </View>

          {/* ── Description ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <View>
                  <Input
                    label="Description"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.description?.message}
                    placeholder="Describe what this is about…"
                    multiline
                    numberOfLines={4}
                    style={styles.multiline}
                    maxLength={1000}
                  />
                  <Text style={styles.charCount}>{description.length}/1000</Text>
                </View>
              )}
            />
          </View>

          {/* ── Category ──────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <CategoryPicker
                  value={value}
                  onChange={onChange}
                  error={errors.category?.message}
                />
              )}
            />
          </View>

          {/* ── EVENT FIELDS ──────────────────────────────────────────────── */}
          {selectedType === 'event' && (
            <View style={styles.section}>
              <SectionBar label="Event Details" />
              <Controller
                control={control}
                name="eventDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Date"
                    value={value}
                    onChange={onChange}
                    placeholder="Pick a date"
                  />
                )}
              />
              <Controller
                control={control}
                name="eventTime"
                render={({ field: { value, onChange } }) => (
                  <TimePicker
                    label="Time"
                    value={value}
                    onChange={onChange}
                    placeholder="e.g. 7:00 PM"
                  />
                )}
              />
              <Controller
                control={control}
                name="location"
                render={({ field: { value, onChange } }) => (
                  <LocationAutocomplete
                    label="Location"
                    value={value}
                    onChange={onChange}
                    error={errors.location?.message}
                    placeholder="Venue name or address"
                  />
                )}
              />
              <Controller
                control={control}
                name="girlsOnly"
                render={({ field: { value, onChange } }) => (
                  <ToggleRow
                    label="Girls Only"
                    hint="Restrict to women only"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="isFree"
                render={({ field: { value, onChange } }) => (
                  <ToggleRow
                    label="Free Event"
                    hint="No cost to attend"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {!isFree && (
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                      label="Price"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="e.g. $25"
                    />
                  )}
                />
              )}
              <Controller
                control={control}
                name="maxParticipants"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Max Participants (optional)"
                    value={value === undefined ? '' : String(value)}
                    onChangeText={(t) =>
                      onChange(t.length > 0 ? Number.parseInt(t, 10) : undefined)
                    }
                    onBlur={onBlur}
                    keyboardType="number-pad"
                    placeholder="Leave empty for unlimited"
                  />
                )}
              />
              <Controller
                control={control}
                name="registrationLink"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Registration Link (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="https://..."
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
          )}

          {/* ── OFFER FIELDS ──────────────────────────────────────────────── */}
          {selectedType === 'offer' && (
            <View style={styles.section}>
              <SectionBar label="Offer Details" />
              <Controller
                control={control}
                name="discountLabel"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Discount Label"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder='"25% OFF", "Buy 1 Get 1"'
                  />
                )}
              />
              <Controller
                control={control}
                name="validUntil"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Valid Until"
                    value={value}
                    onChange={onChange}
                    minimumDate={new Date()}
                    placeholder="Pick an expiry date"
                  />
                )}
              />
              <Controller
                control={control}
                name="promoCode"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Promo Code (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. SPRING25"
                    autoCapitalize="characters"
                  />
                )}
              />
              <Controller
                control={control}
                name="shopLink"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Link to Shop (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="https://..."
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
          )}

          {/* ── UPDATE FIELDS ─────────────────────────────────────────────── */}
          {selectedType === 'update' && (
            <View style={styles.section}>
              <SectionBar label="Additional Details" />
              <Controller
                control={control}
                name="deadline"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Deadline (optional)"
                    value={value}
                    onChange={onChange}
                    minimumDate={new Date()}
                    placeholder="Set a deadline"
                  />
                )}
              />
              <Controller
                control={control}
                name="externalLink"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="External Link (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="https://..."
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
          )}
          {/* ── Visibility Window ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionBar label="Visibility Window" />
            <Text style={styles.visibilityHint}>
              When should this post appear on the feed? It will be automatically hidden after the
              end date. Max {MAX_VISIBILITY_DAYS} days.
            </Text>
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
                  rangeStart={visibilityStart}
                  error={errors.visibilityEnd?.message}
                  helperText={`Max ${MAX_VISIBILITY_DAYS} days after the start date`}
                />
              )}
            />
          </View>
        </ScrollView>

        {/* ── Sticky Save Bar ─────────────────────────────────────────────── */}
        <View style={styles.stickyBar}>
          <Button
            title="Save Changes"
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
            style={styles.saveBtn}
          />
        </View>
      </View>
    </Screen>
  );
}

// ── Shared sub-components (same as create.tsx) ────────────────────────────────

function SectionBar({ label }: Readonly<{ label: string }>) {
  return (
    <View style={sectionBarStyles.row}>
      <View style={sectionBarStyles.line} />
      <Text style={sectionBarStyles.label}>{label}</Text>
    </View>
  );
}
const sectionBarStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] },
  line: { width: 3, height: 16, backgroundColor: colors.burgundy.mid, borderRadius: 2 },
  label: { fontSize: 16, fontWeight: '700', color: colors.warm.title },
});

function CategoryPicker({
  value,
  onChange,
  error,
}: Readonly<{ value: string | undefined; onChange: (v: string) => void; error?: string | undefined }>) {
  const [open, setOpen] = useState(false);
  const hasError = error !== undefined && error.length > 0;
  return (
    <View style={cpStyles.wrapper}>
      <Text style={cpStyles.label}>Category</Text>
      <TouchableOpacity
        style={[cpStyles.trigger, hasError && cpStyles.triggerError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[cpStyles.triggerText, !value && cpStyles.placeholder]}>
          {value ?? 'Select a category'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.warm.muted} />
      </TouchableOpacity>
      {hasError && <Text style={cpStyles.errorText}>{error}</Text>}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={cpStyles.overlay}>
          <View style={cpStyles.sheet}>
            <View style={cpStyles.sheetHeader}>
              <Text style={cpStyles.sheetTitle}>Select a Category</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.warm.muted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ANNOUNCEMENT_CATEGORIES as unknown as string[]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[cpStyles.option, value === item && cpStyles.optionActive]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[cpStyles.optionText, value === item && cpStyles.optionTextActive]}>
                    {item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark" size={16} color={colors.burgundy.mid} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const cpStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing[4] },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.warm.muted,
    marginBottom: spacing[2],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    paddingHorizontal: spacing[3],
  },
  triggerError: { borderColor: colors.error[500] },
  triggerText: { fontSize: 15, color: colors.warm.body },
  placeholder: { color: colors.warm.muted },
  errorText: { fontSize: 11, color: colors.error[500], marginTop: spacing[1] },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing[8],
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.warm.title },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.border,
  },
  optionActive: { backgroundColor: 'rgba(68, 0, 7, 0.04)' },
  optionText: { fontSize: 15, color: colors.warm.body },
  optionTextActive: { color: colors.burgundy.mid, fontWeight: '600' },
});

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: Readonly<{ label: string; hint: string; value: boolean; onChange: (v: boolean) => void }>) {
  return (
    <View style={toggleStyles.row}>
      <View style={toggleStyles.info}>
        <Text style={toggleStyles.label}>{label}</Text>
        <Text style={toggleStyles.hint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#78716c', true: colors.burgundy.mid }}
        ios_backgroundColor="#78716c"
        thumbColor={colors.warm.elevated}
      />
    </View>
  );
}
const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warm.surface,
    borderWidth: 1,
    borderColor: colors.warm.border,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  info: { flex: 1, gap: spacing[1] },
  label: { fontSize: 14, fontWeight: '600', color: colors.warm.title },
  hint: { fontSize: 11, color: colors.warm.muted },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(68, 0, 7, 0.06)',
    borderRadius: 8,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginBottom: spacing[4],
  },
  liveBannerText: { fontSize: 12, color: colors.burgundy.mid, fontWeight: '600' },
  scroll: { paddingBottom: spacing[4] },
  section: { marginBottom: spacing[5] },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.warm.muted,
    marginBottom: spacing[2],
  },
  typeGrid: { flexDirection: 'row', gap: spacing[2] },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    gap: spacing[1],
  },
  typeCardActive: { borderColor: colors.burgundy.mid, backgroundColor: 'rgba(68, 0, 7, 0.05)' },
  typeIcon: { marginBottom: spacing[1] },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warm.title,
    textAlign: 'center',
    lineHeight: 14,
  },
  typeLabelActive: { color: colors.burgundy.mid },
  typeDesc: {
    fontSize: 9,
    color: colors.warm.muted,
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 2,
  },
  imageContainer: { position: 'relative', borderRadius: 12, overflow: 'hidden', height: 176 },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePicker: {
    height: 144,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  imagePickerText: { fontSize: 12, color: colors.warm.muted, fontWeight: '500' },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing[2] },
  charCount: { fontSize: 10, color: colors.warm.muted, textAlign: 'right', marginTop: spacing[1] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[4] },
  mutedText: { fontSize: 15, color: colors.warm.muted, textAlign: 'center' },
  visibilityHint: {
    fontSize: 12,
    color: colors.warm.muted,
    lineHeight: 18,
    marginBottom: spacing[4],
  },
  stickyBar: {
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.warm.border,
    backgroundColor: colors.warm.elevated,
  },
  saveBtn: { borderRadius: 999 },
});
