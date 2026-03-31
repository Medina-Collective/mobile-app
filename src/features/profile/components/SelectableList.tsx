import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
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
    backgroundColor: colors.burgundy.raised,
    borderColor: '#CEC1AE',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.burgundy.mid,
  },
  dotSelected: {
    backgroundColor: '#CEC1AE',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.burgundy.muted,
  },
  itemLabelSelected: {
    color: '#CEC1AE',
    fontWeight: '600',
  },
});
