import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useListProfessionals } from '@features/discover/hooks/useProfessional';
import { ProfessionalList } from '@features/discover/components/ProfessionalList';
import { useFavoritesStore } from '@store/favorites.store';

export default function FavoritesScreen() {
  const { data: professionals, isLoading, isError, refetch } = useListProfessionals();
  const favoritedIds = useFavoritesStore((s) => s.favoritedIds);

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const favorited = professionals?.filter((p) => favoritedIds.includes(p.id)) ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="heading2">Favorites</Text>
        <Text variant="bodySm" style={styles.subtitle}>
          Shops and services you&apos;ve saved
        </Text>
      </View>

      <ProfessionalList
        data={favorited}
        isLoading={isLoading}
        isError={isError}
        onRetry={handleRetry}
        errorMessage="Could not load favorites."
        emptyMessage="Tap the heart on any profile to save it here."
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
