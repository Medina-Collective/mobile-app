import { View, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

export default function EventsScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="heading2">Events</Text>
        <Text variant="body" style={styles.subtitle}>
          Discover what's happening in your community
        </Text>
      </View>

      <View style={styles.placeholder}>
        <Text variant="body" style={styles.placeholderText}>
          Events feed coming soon
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
  subtitle: {
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
