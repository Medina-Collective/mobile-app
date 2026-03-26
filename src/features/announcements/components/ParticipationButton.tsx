import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useParticipation } from '../hooks/useParticipation';

interface ParticipationButtonProps {
  announcementId: string;
  participantCount: number;
  maxCapacity?: number | undefined;
  /** Compact variant used inside feed cards */
  compact?: boolean | undefined;
}

export function ParticipationButton({
  announcementId,
  participantCount,
  maxCapacity,
  compact = false,
}: Readonly<ParticipationButtonProps>) {
  const { isParticipating, toggle, isToggling } = useParticipation(announcementId);

  const isFull = maxCapacity !== undefined && participantCount >= maxCapacity && !isParticipating;

  return (
    <View style={compact ? styles.compactWrapper : styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.button,
          isParticipating && styles.buttonActive,
          isFull && styles.buttonFull,
          compact && styles.buttonCompact,
        ]}
        onPress={toggle}
        disabled={isToggling || isFull}
        activeOpacity={0.75}
      >
        {isToggling ? (
          <ActivityIndicator
            size="small"
            color={isParticipating ? colors.burgundy.deep : colors.neutral[0]}
          />
        ) : (
          <Text
            variant="label"
            style={[styles.label, isParticipating && styles.labelActive]}
            numberOfLines={1}
          >
            {isFull ? '🔒 Full' : isParticipating ? '✓ Going' : '+ Confirm Participation'}
          </Text>
        )}
      </TouchableOpacity>

      <Text variant="caption" style={styles.count}>
        {participantCount} going
        {maxCapacity !== undefined ? ` · ${maxCapacity - participantCount} spots left` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[2],
  },
  compactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  button: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: spacing[5],
    backgroundColor: colors.burgundy.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCompact: {
    height: 36,
    paddingHorizontal: spacing[4],
  },
  buttonActive: {
    backgroundColor: colors.beige[200],
  },
  buttonFull: {
    backgroundColor: colors.neutral[300],
  },
  label: {
    color: colors.neutral[0],
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.burgundy.deep,
  },
  count: {
    color: colors.neutral[500],
  },
});
