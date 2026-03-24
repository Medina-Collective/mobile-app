import { View, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

const logo = require('@assets/images/logo-compact.jpg') as number;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── Brand mark ───────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Brand logo */}
          <Image source={logo} style={styles.logo} resizeMode="contain" />

          {/* Crimson accent line + tagline */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
          </View>

          <Text variant="bodySm" style={styles.tagline}>
            For Muslim women's events, brands &amp; community.
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
    backgroundColor: colors.burgundy.deep,
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
  logo: {
    width: 230,
    height: 230,
  },
  dividerRow: {
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: colors.burgundy.mid,
  },
  tagline: {
    color: colors.beige[400],
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Actions
  actions: {
    gap: spacing[3],
  },
  button: {
    width: '100%',
  },
});
