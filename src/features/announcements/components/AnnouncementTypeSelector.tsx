import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ANNOUNCEMENT_TYPE_OPTIONS } from '../schemas/announcement.schema';
import type { AnnouncementType } from '@app-types/announcement';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface AnnouncementTypeSelectorProps {
  value: AnnouncementType | undefined;
  onChange: (type: AnnouncementType) => void;
  error?: string;
}

export function AnnouncementTypeSelector({
  value,
  onChange,
  error,
}: Readonly<AnnouncementTypeSelectorProps>) {
  return (
    <View>
      <View style={styles.grid}>
        {ANNOUNCEMENT_TYPE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={option.icon as IoniconName}
                size={22}
                color={isSelected ? colors.burgundy.mid : colors.warm.muted}
              />
              <Text style={[styles.label, isSelected && styles.labelSelected]} numberOfLines={1}>
                {option.label}
              </Text>
              <Text style={[styles.description, isSelected && styles.descriptionSelected]} numberOfLines={2}>
                {option.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error !== undefined && error.length > 0 && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  card: {
    width: '47%',
    borderWidth: 1,
    borderColor: colors.warm.border,
    borderRadius: 16,
    padding: spacing[3],
    gap: spacing[1],
    backgroundColor: colors.warm.surface,
  },
  cardSelected: {
    borderColor: colors.burgundy.mid,
    backgroundColor: 'rgba(40, 2, 10, 0.06)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warm.body,
  },
  labelSelected: {
    color: colors.burgundy.mid,
  },
  description: {
    fontSize: 11,
    color: colors.warm.muted,
    lineHeight: 15,
  },
  descriptionSelected: {
    color: colors.burgundy.muted,
  },
  errorText: {
    marginTop: spacing[2],
    color: colors.error[500],
  },
});
