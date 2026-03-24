import { useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useListProfessionals } from '@features/discover/hooks/useProfessional';
import { ProfessionalCard } from '@features/discover/components/ProfessionalCard';
import { useFavoritesStore } from '@store/favorites.store';

function ListSeparator() {
  return <View style={styles.separator} />;
}

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

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cdc1ad" />
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <Text variant="bodySm" style={styles.errorText}>
            Could not load favorites.
          </Text>
          <Button title="Try again" variant="outline" onPress={handleRetry} />
        </View>
      )}

      {!isLoading && !isError && favorited.length === 0 && (
        <View style={styles.centered}>
          <Text variant="bodySm" style={styles.emptyText}>
            Tap the heart on any profile to save it here.
          </Text>
        </View>
      )}

      {favorited.length > 0 && (
        <FlatList
          data={favorited}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProfessionalCard professional={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={ListSeparator}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  errorText: {
    color: colors.neutral[500],
    textAlign: 'center',
  },
  emptyText: {
    color: colors.neutral[400],
    textAlign: 'center',
    paddingHorizontal: spacing[8],
  },
  list: {
    paddingBottom: spacing[8],
  },
  separator: {
    height: spacing[3],
  },
});
