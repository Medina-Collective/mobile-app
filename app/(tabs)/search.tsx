import { useState, useCallback, useMemo } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';
import { useListProfessionals } from '@features/discover/hooks/useProfessional';
import { ProfessionalList } from '@features/discover/components/ProfessionalList';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data: professionals, isLoading, isError, refetch } = useListProfessionals();

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const filtered = useMemo(() => {
    if (!query.trim()) return professionals;
    const q = query.toLowerCase();
    return professionals?.filter(
      (p) =>
        p.businessName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.basedIn.toLowerCase().includes(q),
    );
  }, [professionals, query]);

  function renderContent() {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.burgundy.mid} />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load professionals.</Text>
          <Button title="Try again" variant="outline" onPress={handleRetry} />
        </View>
      );
    }
    return (
      <ProfessionalList
        data={filtered}
        isLoading={false}
        isError={false}
        onRetry={handleRetry}
        errorMessage=""
        emptyMessage={query.trim() ? `No results for "${query}"` : 'No professionals found.'}
      />
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Find Pros</Text>
        <Text style={styles.subtitle}>Shops, services &amp; organizers near you</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={colors.warm.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, category or city…"
          placeholderTextColor={colors.warm.muted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      {renderContent()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.warm.title,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.warm.muted,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.warm.border,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[5],
    gap: spacing[2],
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: fontSize.base,
    color: colors.warm.title,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  errorText: {
    fontSize: 13,
    color: colors.warm.muted,
    textAlign: 'center',
  },
});
