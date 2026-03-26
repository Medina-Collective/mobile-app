import { useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, Button, Input } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';
import {
  professionalProfileSchema,
  CATEGORY_STEP_COPY,
  PRICE_RANGES,
  STEP_FIELDS,
  type ProfessionalProfileFormData,
} from '@features/profile/schemas/professional-profile.schema';
import { StepIndicator } from '@features/profile/components/StepIndicator';
import { BusinessLogoPicker } from '@features/profile/components/BusinessLogoPicker';
import { BusinessTypeSelector } from '@features/profile/components/BusinessTypeSelector';
import { CategorySelector } from '@features/profile/components/CategorySelector';
import { SubcategorySelector } from '@features/profile/components/SubcategorySelector';
import { ServiceTypeSelector } from '@features/profile/components/ServiceTypeSelector';
import { LocationStep } from '@features/profile/components/LocationStep';
import { ProfilePreviewCard } from '@features/profile/components/ProfilePreviewCard';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

// ── Props ──────────────────────────────────────────────────────────────────────

interface ProfileWizardProps {
  defaultValues?: Partial<ProfessionalProfileFormData> | undefined;
  onSubmit: (data: ProfessionalProfileFormData) => Promise<void>;
  submitLabel: string;
  onCancel?: (() => void) | undefined;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ProfileWizard({
  defaultValues,
  onSubmit,
  submitLabel,
  onCancel,
}: Readonly<ProfileWizardProps>) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      businessName: '',
      category: '',
      subcategories: [],
      serviceTypes: [],
      basedIn: '',
      servesAreas: [],
      description: '',
      inquiryEmail: '',
      instagram: '',
      website: '',
      phone: '',
      bookingLink: '',
      startingPrice: '',
      ...defaultValues,
    },
  });

  const watchedValues = watch();

  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: false });

  // Step 2 (index 2) is Subcategory — only relevant for 'service' profile type
  const shouldSkipSubcategory = watchedValues.profileType !== 'service';

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    if (fields !== undefined && fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) return;
    }
    const nextStep = currentStep + 1;
    // Skip subcategory step for non-service types
    const resolvedNext = nextStep === 2 && shouldSkipSubcategory ? 3 : nextStep;
    scrollToTop();
    setCurrentStep(resolvedNext);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      if (onCancel === undefined) {
        router.back();
      } else {
        onCancel();
      }
      return;
    }
    const prevStep = currentStep - 1;
    // Skip subcategory step for non-service types when going back
    const resolvedPrev = prevStep === 2 && shouldSkipSubcategory ? 1 : prevStep;
    scrollToTop();
    setCurrentStep(resolvedPrev);
  };

  const onSubmitHandler: SubmitHandler<ProfessionalProfileFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <>
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step 0: Profile Type ──────────────────────────────────────────── */}
        {currentStep === 0 && (
          <View>
            <View style={styles.stepHeader}>
              <Text variant="heading2" style={styles.stepTitle}>
                {"Let's set up\nyour profile"}
              </Text>
              <Text variant="bodySm" style={styles.stepSubtitle}>
                Tell us who you are so the right people can find you.
              </Text>
            </View>

            <Controller
              control={control}
              name="logoUri"
              render={({ field: { value, onChange } }) => (
                <BusinessLogoPicker
                  businessName={watchedValues.businessName}
                  logoUri={value}
                  onPress={async () => {
                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permission.granted) {
                      Alert.alert(
                        'Permission needed',
                        'Allow access to your photo library to add a logo.',
                      );
                      return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ['images'],
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.8,
                    });
                    if (!result.canceled && result.assets[0]) {
                      onChange(result.assets[0].uri);
                    }
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="businessName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Business or profile name"
                  placeholder="Your name, brand, or initiative"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  error={errors.businessName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="profileType"
              render={({ field: { value, onChange } }) => (
                <BusinessTypeSelector
                  value={value}
                  onChange={onChange}
                  error={errors.profileType?.message}
                />
              )}
            />
          </View>
        )}

        {/* ── Step 1: Category ──────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <View>
            <View style={styles.stepHeader}>
              <Text variant="heading2" style={styles.stepTitle}>
                {watchedValues.profileType === undefined
                  ? 'Your category'
                  : CATEGORY_STEP_COPY[watchedValues.profileType].title}
              </Text>
              <Text variant="bodySm" style={styles.stepSubtitle}>
                {watchedValues.profileType === undefined
                  ? 'Select one category.'
                  : CATEGORY_STEP_COPY[watchedValues.profileType].subtitle}
              </Text>
            </View>

            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <CategorySelector
                  profileType={watchedValues.profileType}
                  value={value}
                  onChange={(cat) => {
                    onChange(cat);
                    // Reset subcategories when category changes
                    setValue('subcategories', []);
                  }}
                  error={errors.category?.message}
                />
              )}
            />
          </View>
        )}

        {/* ── Step 2: Subcategory (service only) ───────────────────────────── */}
        {currentStep === 2 && (
          <View>
            <View style={styles.stepHeader}>
              <Text variant="heading2" style={styles.stepTitle}>
                What do you specialise in?
              </Text>
              <Text variant="bodySm" style={styles.stepSubtitle}>
                Select all that apply. This helps people find the right fit.
              </Text>
            </View>

            <SubcategorySelector
              category={watchedValues.category}
              value={watchedValues.subcategories}
              onChange={(subs) => setValue('subcategories', subs)}
            />
          </View>
        )}

        {/* ── Step 3: Service Type ─────────────────────────────────────────── */}
        {currentStep === 3 && (
          <View>
            <View style={styles.stepHeader}>
              <Text variant="heading2" style={styles.stepTitle}>
                How do you work?
              </Text>
              <Text variant="bodySm" style={styles.stepSubtitle}>
                Select all that apply. Optional but helps people find you.
              </Text>
            </View>

            <ServiceTypeSelector
              value={watchedValues.serviceTypes}
              onChange={(types) => setValue('serviceTypes', types)}
            />
          </View>
        )}

        {/* ── Step 4: Location ─────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <View>
            <View style={styles.stepHeader}>
              <Text variant="heading2" style={styles.stepTitle}>
                Where are you located?
              </Text>
              <Text variant="bodySm" style={styles.stepSubtitle}>
                Help your community know where to find you.
              </Text>
            </View>

            <LocationStep
              basedIn={watchedValues.basedIn}
              onBasedInChange={(val) => setValue('basedIn', val)}
              basedInError={errors.basedIn?.message}
              servesAreas={watchedValues.servesAreas}
              onServesAreasChange={(val) => setValue('servesAreas', val)}
            />
          </View>
        )}

        {/* ── Step 5: About & Contact ──────────────────────────────────────── */}
        {currentStep === 5 && (
          <View>
            <View style={styles.stepHeader}>
              <Text variant="heading2" style={styles.stepTitle}>
                About & contact
              </Text>
              <Text variant="bodySm" style={styles.stepSubtitle}>
                Help your community know you and reach out.
              </Text>
            </View>

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <View style={styles.textareaWrapper}>
                  <Text variant="overline" style={styles.textareaLabel}>
                    Short description
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Share a little about who you are, what you do, and who you serve..."
                    placeholderTextColor="#7b625b"
                    multiline
                    numberOfLines={4}
                    style={[
                      styles.textarea,
                      errors.description === undefined
                        ? styles.textareaDefault
                        : styles.textareaError,
                    ]}
                  />
                  <View style={styles.textareaFooter}>
                    {errors.description === undefined ? (
                      <View />
                    ) : (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.description.message}
                      </Text>
                    )}
                    <Text variant="caption" style={styles.charCount}>
                      {value.length}/300
                    </Text>
                  </View>
                </View>
              )}
            />

            {/* Price range */}
            <View style={styles.fieldGroup}>
              <Text variant="overline" style={styles.groupLabel}>
                Price range (optional)
              </Text>
              <Controller
                control={control}
                name="priceRange"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.chipRow}>
                    {PRICE_RANGES.map((range) => {
                      const isSelected = value === range;
                      return (
                        <View
                          key={range}
                          style={[styles.priceChip, isSelected && styles.priceChipSelected]}
                        >
                          <Text
                            onPress={() => onChange(isSelected ? undefined : range)}
                            style={[styles.priceLabel, isSelected && styles.priceLabelSelected]}
                          >
                            {range}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* Starting price */}
            <Controller
              control={control}
              name="startingPrice"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Starting price (optional)"
                  placeholder="e.g. $50, $25/hr"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                />
              )}
            />

            {/* Public inquiry email */}
            <Controller
              control={control}
              name="inquiryEmail"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Input
                    label="Public inquiry email"
                    placeholder="hello@yourbusiness.com"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.inquiryEmail?.message}
                  />
                  <Text variant="caption" style={styles.fieldNote}>
                    Shown on your profile — separate from your login email.
                  </Text>
                </View>
              )}
            />

            {/* Instagram */}
            <Controller
              control={control}
              name="instagram"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Instagram handle (optional)"
                  placeholder="yourhandle (without @)"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            {/* Booking link */}
            <Controller
              control={control}
              name="bookingLink"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Booking link (optional)"
                  placeholder="e.g. Calendly, Square, etc."
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="url"
                  autoCorrect={false}
                />
              )}
            />

            {/* Website */}
            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Website (optional)"
                  placeholder="https://yourwebsite.com"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="url"
                  autoCorrect={false}
                />
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone / WhatsApp (optional)"
                  placeholder="+1 555 000 0000"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>
        )}

        {/* ── Step 6: Review ────────────────────────────────────────────────── */}
        {currentStep === 6 && (
          <View>
            <View style={styles.stepHeader}>
              <Text variant="heading2" style={styles.stepTitle}>
                Review your profile
              </Text>
              <Text variant="bodySm" style={styles.stepSubtitle}>
                Once submitted, our team will review your profile before it goes live.
              </Text>
            </View>

            <View style={styles.previewCard}>
              <ProfilePreviewCard
                data={watchedValues}
                onEditStep={(step) => {
                  scrollToTop();
                  setCurrentStep(step);
                }}
              />
            </View>

            <View style={styles.reviewNote}>
              <Text variant="caption" style={styles.reviewNoteText}>
                Your profile will be submitted for review. You will be notified once it is approved
                and visible to the community.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <View style={styles.navRow}>
        <Button
          title={currentStep === 0 ? 'Cancel' : 'Back'}
          variant="ghost"
          onPress={handleBack}
          style={styles.backBtn}
        />
        {isLastStep ? (
          <Button
            title={submitLabel}
            onPress={() => void handleSubmit(onSubmitHandler)()}
            loading={isSubmitting}
            style={styles.nextBtn}
          />
        ) : (
          <Button title="Next" onPress={() => void handleNext()} style={styles.nextBtn} />
        )}
      </View>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing[8],
    paddingTop: spacing[2],
    paddingBottom: spacing[6],
  },
  stepHeader: {
    marginBottom: spacing[8],
    gap: spacing[3],
  },
  stepTitle: {
    color: '#CEC1AE',
  },
  stepSubtitle: {
    color: '#7b625b',
  },

  // Description textarea
  textareaWrapper: {
    marginBottom: spacing[2],
  },
  textareaLabel: {
    marginBottom: spacing[2],
    color: '#7b625b',
  },
  textarea: {
    minHeight: 100,
    borderBottomWidth: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: 0,
    fontSize: fontSize.base,
    color: '#CEC1AE',
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
  },
  textareaDefault: {
    borderBottomColor: '#7b625b',
  },
  textareaError: {
    borderBottomColor: colors.error[500],
  },
  textareaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[1],
    marginBottom: spacing[6],
  },
  errorText: {
    color: colors.error[500],
  },
  charCount: {
    color: colors.burgundy.muted,
  },

  // Field note
  fieldNote: {
    color: colors.burgundy.muted,
    marginTop: -spacing[4],
    marginBottom: spacing[6],
  },

  // Price range
  fieldGroup: {
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  groupLabel: {
    color: '#7b625b',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  priceChip: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
    alignItems: 'center',
  },
  priceChipSelected: {
    borderColor: '#CEC1AE',
    backgroundColor: colors.burgundy.raised,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.burgundy.muted,
  },
  priceLabelSelected: {
    color: '#CEC1AE',
    fontWeight: '700',
  },

  // Review card
  previewCard: {
    backgroundColor: colors.burgundy.surface,
    borderRadius: 16,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.burgundy.raised,
  },
  reviewNote: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[2],
  },
  reviewNoteText: {
    color: colors.burgundy.muted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Nav
  navRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.burgundy.surface,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
    backgroundColor: '#CEC1AE',
  },
});
