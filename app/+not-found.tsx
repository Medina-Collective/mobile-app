import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text variant="heading3">Page Not Found</Text>
      <Text variant="body" style={styles.message}>
        This screen doesn't exist.
      </Text>
      <Link href="/(tabs)" style={styles.link}>
        <Text variant="bodyBold" style={styles.linkText}>
          Go to Home
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.neutral[0],
  },
  message: {
    marginTop: spacing[2],
    color: colors.neutral[500],
  },
  link: {
    marginTop: spacing[6],
  },
  linkText: {
    color: colors.crimson[400],
  },
});
