import { View, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { CATEGORIES_BY_TYPE, type ProfileType } from '../schemas/professional-profile.schema';
import { SelectableList } from './SelectableList';

interface CategorySelectorProps {
  profileType: ProfileType | undefined;
  value: string;
  onChange: (category: string) => void;
  error?: string | undefined;
}

export function CategorySelector({
  profileType,
  value,
  onChange,
  error,
}: Readonly<CategorySelectorProps>) {
  if (profileType === undefined) {
    return (
      <Text variant="bodySm" style={styles.placeholder}>
        Go back and select a profile type first.
      </Text>
    );
  }

  const categories = CATEGORIES_BY_TYPE[profileType];

  return (
    <View>
      <SelectableList options={categories} value={value} onChange={onChange} />
      {error !== undefined && error.length > 0 && (
        <Text variant="caption" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    color: colors.burgundy.muted,
    fontStyle: 'italic',
  },
  error: {
    marginTop: spacing[2],
    color: colors.error[500],
  },
});
