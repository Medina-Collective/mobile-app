import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── Brand mark ───────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.monogram}>
            <Text style={styles.monogramLetter}>M</Text>
          </View>

          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmark}>medina</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.wordmarkSub}>collective</Text>
          </View>

          <View style={styles.divider} />

          <Text variant="bodySm" style={styles.tagline}>
            Your community. Your culture.
          </Text>
        </View>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <Button
            title="Join the community"
            onPress={() => router.push('/(auth)/sign-up')}
            style={styles.button}
          />
          <Button
            title="Sign in"
            variant="ghost"
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.button}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.sand[100],
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[6],
    justifyContent: 'space-between',
  },

  // Brand
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[5],
  },
  monogram: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  monogramLetter: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.neutral[700],
    letterSpacing: 1,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  wordmark: {
    fontSize: 28,
    fontWeight: '200',
    color: colors.neutral[900],
    letterSpacing: 6,
  },
  dot: {
    fontSize: 22,
    color: colors.primary[500],
    fontWeight: '300',
  },
  wordmarkSub: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.neutral[500],
    letterSpacing: 3,
    textTransform: 'uppercase',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: colors.primary[500],
  },
  tagline: {
    color: colors.neutral[400],
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // Actions
  actions: {
    gap: spacing[2],
  },
  button: {
    width: '100%',
  },
});
