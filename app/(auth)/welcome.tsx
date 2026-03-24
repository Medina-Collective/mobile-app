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
          {/* Monogram */}
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>MC</Text>
          </View>

          {/* Wordmark */}
          <View style={styles.wordmarkBlock}>
            <Text style={styles.wordmark}>medina</Text>
            <View style={styles.wordmarkRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.wordmarkSub}>collective</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* Tagline */}
          <Text variant="bodySm" style={styles.tagline}>
            A space of stillness, trust &amp; returning.
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
    backgroundColor: colors.maroon[900],
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
    gap: spacing[7],
  },
  monogram: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.maroon[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  monogramText: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.cream[200],
    letterSpacing: 3,
  },
  wordmarkBlock: {
    alignItems: 'center',
    gap: spacing[2],
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '200',
    color: colors.cream[100],
    letterSpacing: 10,
    textTransform: 'lowercase',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  dividerLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.primary[500],
  },
  wordmarkSub: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.cream[500],
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  tagline: {
    color: colors.maroon[200],
    letterSpacing: 0.3,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Actions
  actions: {
    gap: spacing[3],
  },
  button: {
    width: '100%',
  },
});
