import { View, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

export default function DiscoverScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="heading2">Discover</Text>
        <Text variant="body" style={styles.subtitle}>
          Explore people, places, and culture
        </Text>
      </View>

      <View style={styles.placeholder}>
        <Text variant="body" style={styles.placeholderText}>
          Discovery feed coming soon
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
