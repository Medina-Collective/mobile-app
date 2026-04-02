import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { spacing } from '@theme/spacing';

interface SelectableListProps {
  options: string[];
  value: string;
  onChange: (item: string) => void;
}

export function SelectableList({ options, value, onChange }: Readonly<SelectableListProps>) {
  return (
    <View style={styles.list}>
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            activeOpacity={0.8}
            style={[styles.item, isSelected && styles.itemSelected]}
          >
            <View style={[styles.dot, isSelected && styles.dotSelected]} />
            <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff9f5',
    borderColor: '#2F0A0A',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(160, 122, 95, 0.30)',
  },
  dotSelected: {
    backgroundColor: '#2F0A0A',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(26, 18, 18, 0.55)',
  },
  itemLabelSelected: {
    color: '#1a1212',
    fontWeight: '600',
  },
});
