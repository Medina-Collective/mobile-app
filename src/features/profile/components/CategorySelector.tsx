import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import {
  CATEGORIES_BY_TYPE,
  type ProfileType,
} from '../schemas/professional-profile.schema';

interface CategorySelectorProps {
  profileType: ProfileType | undefined;
  value: string;
  onChange: (category: string) => void;
  error?: string;
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
      <View style={styles.list}>
        {categories.map((cat) => {
          const isSelected = value === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onChange(cat)}
              activeOpacity={0.8}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <View style={[styles.dot, isSelected && styles.dotSelected]} />
              <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  list: {
    gap: spacing[1],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemSelected: {
    backgroundColor: colors.burgundy.raised,
    borderColor: '#cdc1ad',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.burgundy.mid,
  },
  dotSelected: {
    backgroundColor: '#cdc1ad',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.burgundy.muted,
  },
  itemLabelSelected: {
    color: '#cdc1ad',
    fontWeight: '600',
  },
  error: {
    marginTop: spacing[2],
    color: colors.error[500],
  },
});
