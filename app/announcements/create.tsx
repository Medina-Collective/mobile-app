import { useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
import {
  announcementSchema,
  ANNOUNCEMENT_FORM_TYPES,
  MAX_VISIBILITY_DAYS,
} from '@features/announcements/schemas/announcement.schema';
import { useCreateAnnouncement } from '@features/announcements/hooks/useAnnouncement';
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

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { mutate: create, isPending } = useCreateAnnouncement();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      girlsOnly: false,
      isFree: true,
    },
  });

  const coverImageUri = watch('coverImageUri');
  const selectedType = watch('type');
  const isFree = watch('isFree');
  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const visibilityStart = watch('visibilityStart');
  const maxVisibilityEnd =
    visibilityStart === undefined
      ? undefined
      : new Date(visibilityStart.getTime() + MAX_VISIBILITY_DAYS * 24 * 60 * 60 * 1000);

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
  if (user?.role !== USER_ROLES.PROFESSIONAL) {
    return (
      <Screen>
        <View style={sharedFormStyles.centered}>
          <Text style={sharedFormStyles.mutedText}>
            Only professional accounts can create announcements.
          </Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const canPublish = selectedType !== undefined && title.trim().length >= 2;

  return (
    <Screen>
      <View style={styles.flex}>
        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <View style={sharedFormStyles.navRow}>
          <BackButton />
          <Text style={sharedFormStyles.navTitle}>Create Announcement</Text>
          <View style={sharedFormStyles.navSpacer} />
        </View>

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
            {errors.type !== undefined && (
              <Text style={styles.fieldError}>{errors.type.message}</Text>
            )}
          </View>

          {/* ── Cover Image ───────────────────────────────────────────────── */}
          <View style={sharedFormStyles.section}>
            <Text style={sharedFormStyles.fieldLabel}>Cover Image</Text>
            {coverImageUri !== undefined ? (
              <View style={sharedFormStyles.imageContainer}>
                <Image
                  source={{ uri: coverImageUri }}
                  style={sharedFormStyles.imagePreview}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={sharedFormStyles.removeImageBtn}
                  onPress={() => setValue('coverImageUri', undefined)}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={sharedFormStyles.imagePicker}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Ionicons name="image-outline" size={28} color={colors.warm.muted} />
                <Text style={sharedFormStyles.imagePickerText}>Tap to upload</Text>
              </TouchableOpacity>
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
                    minimumDate={new Date()}
                    error={errors.eventDate?.message}
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
                      error={errors.price?.message}
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
                    error={errors.maxParticipants?.message}
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
                    error={errors.registrationLink?.message}
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
                    error={errors.discountLabel?.message}
                    placeholder='e.g. "25% OFF", "Buy 1 Get 1"'
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
                    error={errors.validUntil?.message}
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
                    error={errors.promoCode?.message}
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
                    error={errors.shopLink?.message}
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
                    error={errors.deadline?.message}
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
                    error={errors.externalLink?.message}
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
                  rangeStart={visibilityStart}
                  error={errors.visibilityEnd?.message}
                  helperText={`Max ${MAX_VISIBILITY_DAYS} days after the start date`}
                />
              )}
            />
          </View>
        </ScrollView>

        {/* ── Sticky Publish Bar ──────────────────────────────────────────── */}
        <View style={sharedFormStyles.stickyBar}>
          <Button
            title="Publish Announcement"
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
            disabled={!canPublish}
            style={styles.publishBtn}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fieldError: { fontSize: 11, color: colors.error[500], marginTop: spacing[1] },
  publishBtn: { borderRadius: 999 },
});
