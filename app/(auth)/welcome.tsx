import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoPlaceholder}>
          <Text variant="heading1" style={styles.logoText}>
            M
          </Text>
        </View>
        <Text variant="heading1" style={styles.appName}>
          Medina
        </Text>
        <Text variant="body" style={styles.tagline}>
          Your community. Your culture.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(auth)/sign-up')}
          style={styles.button}
        />
        <Button
          title="Sign In"
          variant="outline"
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    justifyContent: 'space-between',
    padding: spacing[6],
    paddingTop: spacing[16],
    paddingBottom: spacing[10],
  },
  hero: {
    alignItems: 'center',
    gap: spacing[3],
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  logoText: {
    color: colors.neutral[0],
  },
  appName: {
    color: colors.neutral[900],
  },
  tagline: {
    color: colors.neutral[500],
    textAlign: 'center',
  },
  actions: {
    gap: spacing[3],
  },
  button: {
    width: '100%',
  },
});
