import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ProfessionalCard } from './ProfessionalCard';
import type { Professional } from '@app-types/professional';

interface ProfessionalListProps {
  data: Professional[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => Promise<void>;
  errorMessage: string;
  emptyMessage?: string | undefined;
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

export function ProfessionalList({
  data,
  isLoading,
  isError,
  onRetry,
  errorMessage,
  emptyMessage,
}: Readonly<ProfessionalListProps>) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#CEC1AE" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text variant="bodySm" style={styles.errorText}>
          {errorMessage}
        </Text>
        <Button title="Try again" variant="outline" onPress={onRetry} />
      </View>
    );
  }

  if (emptyMessage !== undefined && (data === undefined || data.length === 0)) {
    return (
      <View style={styles.centered}>
        <Text variant="bodySm" style={styles.emptyText}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  if (data === undefined || data.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProfessionalCard professional={item} />}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={ListSeparator}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
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
