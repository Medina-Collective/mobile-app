import { useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useListProfessionals } from '@features/discover/hooks/useProfessional';
import { ProfessionalCard } from '@features/discover/components/ProfessionalCard';

function ListSeparator() {
  return <View style={styles.separator} />;
}

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

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cdc1ad" />
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <Text variant="bodySm" style={styles.errorText}>
            Could not load professionals.
          </Text>
          <Button title="Try again" variant="outline" onPress={handleRetry} />
        </View>
      )}

      {professionals !== undefined && (
        <FlatList
          data={professionals}
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
  list: {
    paddingBottom: spacing[8],
  },
  separator: {
    height: spacing[3],
  },
});
