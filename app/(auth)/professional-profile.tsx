import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { ProfileWizard } from '@features/profile/components/ProfileWizard';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import type { ProfessionalProfileFormData } from '@features/profile/schemas/professional-profile.schema';

export default function ProfessionalProfileScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);

  const handleSubmit = async (data: ProfessionalProfileFormData) => {
    if (!userId) throw new Error('Not authenticated');
    const { error } = await supabase.from('professionals').insert({
      user_id: userId,
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
      status: 'pending_review',
    });
    if (error) throw error;
    router.replace('/(auth)/thank-you');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ProfileWizard submitLabel="Submit for review" onSubmit={handleSubmit} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.burgundy.deep },
  flex: { flex: 1 },
});
