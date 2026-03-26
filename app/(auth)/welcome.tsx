import { View, ImageBackground, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@components/ui';
import { spacing } from '@theme/spacing';
import { colors } from '@theme/colors';

const MC_BEIGE = '#cdc1ad';

const welcomeImage = require('@assets/images/welcome-page-design.png') as number;


export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={welcomeImage} style={styles.background} resizeMode="cover">
      <View style={styles.cityOverlay}>
        <View style={styles.divider} />
        <Text style={styles.city}>Montreal</Text>
      </View>
      <SafeAreaView style={styles.safe}>
        <View style={styles.actions}>
          <Button
            title="Join the community"
            onPress={() => router.push('/(auth)/sign-up')}
            style={styles.joinButton}
            textColor={colors.burgundy.mid}
          />
          <Button
            title="Sign in"
            variant="ghost"
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actions: {
    gap: spacing[3],
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[6],
  },
  joinButton: {
    width: '100%',
    backgroundColor: MC_BEIGE,
  },
  button: {
    width: '100%',
  },
  cityOverlay: {
    position: 'absolute',
    top: '60%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: '#7b625b',
  },
  city: {
    color: '#7b625b',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
