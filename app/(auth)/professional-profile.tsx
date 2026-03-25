import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { ProfileWizard } from '@features/profile/components/ProfileWizard';
import { apiClient } from '@services/api.client';
import type { ProfessionalProfileFormData } from '@features/profile/schemas/professional-profile.schema';

export default function ProfessionalProfileScreen() {
  const router = useRouter();

  const handleSubmit = async (data: ProfessionalProfileFormData) => {
    await apiClient.post('/professionals', data);
    router.replace('/(tabs)');
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
