import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { spacing } from '@theme/spacing';
import { useAuthStore } from '@store/auth.store';

export default function ThankYouScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const handleClose = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => void handleClose()}>
        <Ionicons name="close" size={24} color="#7b625b" />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#CEC1AE" />
        </View>

        <Text variant="heading2" style={styles.heading}>
          {'Request\nsubmitted ♡'}
        </Text>

        <Text variant="bodySm" style={styles.body}>
          Thank you for joining Medina Collective. We have received your verified profile
          application and will review it as soon as possible.
        </Text>

        <Text variant="bodySm" style={styles.body}>
          You will receive an email once your profile is approved and visible to the community.
        </Text>

        <Text variant="caption" style={styles.note}>
          Questions? Reach us at hello@medinacollective.org
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#28030a' },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: spacing[4],
    paddingTop: spacing[6],
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[8],
    paddingTop: spacing[6],
    alignItems: 'center',
  },
  iconWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#3d0a12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  heading: {
    color: '#CEC1AE',
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  body: {
    color: '#7b625b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[4],
  },
  note: {
    color: '#7b625b',
    textAlign: 'center',
    marginTop: spacing[6],
    opacity: 0.6,
  },
});
