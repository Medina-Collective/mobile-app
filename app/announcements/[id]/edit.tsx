import { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
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
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import {
  announcementSchema,
  ANNOUNCEMENT_FORM_TYPES,
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
import {
  SectionBar,
  CategoryPicker,
  ToggleRow,
  sharedFormStyles,
} from '@features/announcements/components/AnnouncementFormShared';
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
        <View style={sharedFormStyles.centered}>
          <ActivityIndicator color={colors.burgundy.mid} />
        </View>
      </Screen>
    );
  }

  if (isError || announcement === undefined) {
    return (
      <Screen>
        <BackButton />
        <View style={sharedFormStyles.centered}>
          <Text style={sharedFormStyles.mutedText}>Could not load this announcement.</Text>
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
        <View style={sharedFormStyles.centered}>
          <Text style={sharedFormStyles.mutedText}>You can only edit your own announcements.</Text>
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
        <View style={sharedFormStyles.navRow}>
          <BackButton />
          <Text style={sharedFormStyles.navTitle}>Edit Announcement</Text>
          <View style={sharedFormStyles.navSpacer} />
        </View>

        {isLive && (
          <View style={styles.liveBanner}>
            <Ionicons name="radio-outline" size={14} color={colors.burgundy.mid} />
            <Text style={styles.liveBannerText}>This post is live on the feed</Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={sharedFormStyles.scroll}
          keyboardShouldPersistTaps="always"
        >
          {/* ── Type ──────────────────────────────────────────────────────── */}
          <View style={sharedFormStyles.section}>
            <Text style={sharedFormStyles.fieldLabel}>Type</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <View style={sharedFormStyles.typeGrid}>
                  {ANNOUNCEMENT_FORM_TYPES.map((pt) => (
                    <TouchableOpacity
                      key={pt.value}
                      style={[
                        sharedFormStyles.typeCard,
                        value === pt.value && sharedFormStyles.typeCardActive,
                      ]}
                      onPress={() => onChange(pt.value)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={pt.icon as never}
                        size={22}
                        color={value === pt.value ? colors.burgundy.mid : colors.warm.muted}
                        style={sharedFormStyles.typeIcon}
                      />
                      <Text
                        style={[
                          sharedFormStyles.typeLabel,
                          value === pt.value && sharedFormStyles.typeLabelActive,
                        ]}
                      >
                        {pt.label}
                      </Text>
                      <Text style={sharedFormStyles.typeDesc}>{pt.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* ── Cover Image ───────────────────────────────────────────────── */}
          <View style={sharedFormStyles.section}>
            <Text style={sharedFormStyles.fieldLabel}>Cover Image</Text>
            {displayImageUri === undefined ? (
              <TouchableOpacity
                style={sharedFormStyles.imagePicker}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Ionicons name="image-outline" size={28} color={colors.warm.muted} />
                <Text style={sharedFormStyles.imagePickerText}>Tap to upload</Text>
              </TouchableOpacity>
            ) : (
              <View style={sharedFormStyles.imageContainer}>
                <Image
                  source={{ uri: displayImageUri }}
                  style={sharedFormStyles.imagePreview}
                  contentFit="cover"
                />
                <TouchableOpacity style={sharedFormStyles.removeImageBtn} onPress={removePhoto}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Title ─────────────────────────────────────────────────────── */}
          <View style={sharedFormStyles.section}>
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
          <View style={sharedFormStyles.section}>
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
                    style={sharedFormStyles.multiline}
                    maxLength={1000}
                  />
                  <Text style={sharedFormStyles.charCount}>{description.length}/1000</Text>
                </View>
              )}
            />
          </View>

          {/* ── Category ──────────────────────────────────────────────────── */}
          <View style={sharedFormStyles.section}>
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
            <View style={sharedFormStyles.section}>
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
            <View style={sharedFormStyles.section}>
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
            <View style={sharedFormStyles.section}>
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
          <View style={sharedFormStyles.section}>
            <SectionBar label="Visibility Window" />
            <Text style={sharedFormStyles.visibilityHint}>
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
        <View style={sharedFormStyles.stickyBar}>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  saveBtn: { borderRadius: 999 },
});
