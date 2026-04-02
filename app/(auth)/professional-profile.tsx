import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileWizard } from '@features/profile/components/ProfileWizard';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import { formDataToRow } from '@features/profile/utils/professional-profile.utils';
import type { ProfessionalProfileFormData } from '@features/profile/schemas/professional-profile.schema';

export default function ProfessionalProfileScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);

  const handleSubmit = async (data: ProfessionalProfileFormData) => {
    if (!userId) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('professionals')
      .insert({ ...formDataToRow(data), user_id: userId, status: 'pending_review' });
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
  safe: { flex: 1, backgroundColor: '#faf6f0' },
  flex: { flex: 1 },
});
