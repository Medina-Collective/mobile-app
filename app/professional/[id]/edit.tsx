import { KeyboardAvoidingView, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { Text } from '@components/ui';
import { ProfileWizard } from '@features/profile/components/ProfileWizard';
import { useGetProfessional } from '@features/discover/hooks/useProfessional';
import { supabase } from '@services/supabase.client';
import type { ProfessionalProfileFormData } from '@features/profile/schemas/professional-profile.schema';

export default function EditProfessionalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: professional, isLoading, isError } = useGetProfessional(id);

  const handleSave = async (data: ProfessionalProfileFormData) => {
    const { error } = await supabase
      .from('professionals')
      .update({
        business_name: data.businessName,
        profile_type: data.profileType,
        category: data.category,
        subcategories: data.subcategories,
        service_types: data.serviceTypes,
        based_in: data.basedIn,
        serves_areas: data.servesAreas,
        description: data.description,
        inquiry_email: data.inquiryEmail,
        instagram: data.instagram ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        booking_link: data.bookingLink ?? null,
        price_range: data.priceRange ?? null,
        starting_price: data.startingPrice ?? null,
        logo_uri: data.logoUri ?? null,
      })
      .eq('id', id);
    if (error) throw error;
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cdc1ad" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || professional === undefined) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text variant="bodySm" style={styles.errorText}>
            Could not load profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const defaultValues: Partial<ProfessionalProfileFormData> = {
    businessName: professional.businessName,
    profileType: professional.profileType,
    category: professional.category,
    subcategories: professional.subcategories,
    serviceTypes: professional.serviceTypes,
    basedIn: professional.basedIn,
    servesAreas: professional.servesAreas,
    description: professional.description,
    inquiryEmail: professional.inquiryEmail,
    instagram: professional.instagram ?? '',
    phone: professional.phone ?? '',
    website: professional.website ?? '',
    bookingLink: professional.bookingLink ?? '',
    priceRange: professional.priceRange,
    startingPrice: professional.startingPrice ?? '',
    logoUri: professional.logoUri ?? '',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ProfileWizard
          defaultValues={defaultValues}
          submitLabel="Save changes"
          onSubmit={handleSave}
          onCancel={() => router.back()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.burgundy.deep },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.burgundy.muted,
    textAlign: 'center',
  },
});
