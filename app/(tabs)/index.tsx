import { View, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="overline" style={styles.greeting}>
          Welcome back
        </Text>
        <Text variant="heading2">{user?.displayName ?? 'Medina'}</Text>
      </View>

      <View style={styles.placeholder}>
        <Text variant="body" style={styles.placeholderText}>
          Home feed coming soon
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[1],
  },
  greeting: {
    color: colors.neutral[500],
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.neutral[400],
  },
});
