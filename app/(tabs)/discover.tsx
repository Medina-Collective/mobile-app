import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useListProfessionals } from '@features/discover/hooks/useProfessional';
import { ProfessionalList } from '@features/discover/components/ProfessionalList';

export default function DiscoverScreen() {
  const { data: professionals, isLoading, isError, refetch } = useListProfessionals();

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="heading2">Discover</Text>
        <Text variant="bodySm" style={styles.subtitle}>
          Find shops, services & classes near you
        </Text>
      </View>

      <ProfessionalList
        data={professionals}
        isLoading={isLoading}
        isError={isError}
        onRetry={handleRetry}
        errorMessage="Could not load professionals."
      />
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
});
