import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { SUBCATEGORIES_BY_CATEGORY } from '../schemas/professional-profile.schema';

interface SubcategorySelectorProps {
  category: string;
  value: string[];
  onChange: (subcategories: string[]) => void;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function SubcategorySelector({
  category,
  value,
  onChange,
}: Readonly<SubcategorySelectorProps>) {
  const subcategories = SUBCATEGORIES_BY_CATEGORY[category];

  if (subcategories === undefined || subcategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.tags}>
      {subcategories.map((sub) => {
        const isSelected = value.includes(sub);
        return (
          <TouchableOpacity
            key={sub}
            onPress={() => onChange(toggleItem(value, sub))}
            activeOpacity={0.8}
            style={[styles.tag, isSelected && styles.tagSelected]}
          >
            <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>
              {sub}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tag: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
  },
  tagSelected: {
    backgroundColor: colors.burgundy.raised,
    borderColor: '#cdc1ad',
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.burgundy.muted,
  },
  tagLabelSelected: {
    color: '#cdc1ad',
    fontWeight: '600',
  },
});
