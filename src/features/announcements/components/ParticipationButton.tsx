import type React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  let buttonContent: React.ReactNode;
  if (isToggling) {
    buttonContent = <ActivityIndicator size="small" color="#ffffff" />;
  } else if (isFull) {
    buttonContent = (
      <View style={styles.row}>
        <Ionicons name="lock-closed" size={13} color={colors.neutral[500]} />
        <Text variant="label" style={styles.labelFull} numberOfLines={1}>Full</Text>
      </View>
    );
  } else if (isParticipating) {
    buttonContent = (
      <View style={styles.row}>
        <Ionicons name="checkmark" size={15} color="#CEC1AE" />
        <Text variant="label" style={[styles.label, styles.labelActive]} numberOfLines={1}>Going</Text>
      </View>
    );
  } else {
    buttonContent = (
      <View style={styles.row}>
        <Ionicons name="add" size={15} color="#ffffff" />
        <Text variant="label" style={styles.label} numberOfLines={1}>Participate</Text>
      </View>
    );
  }

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
        {buttonContent}
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
    backgroundColor: '#2F0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCompact: {
    height: 36,
    paddingHorizontal: spacing[4],
  },
  buttonActive: {
    backgroundColor: '#2F0A0A',
  },
  buttonFull: {
    backgroundColor: colors.neutral[300],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: '#CEC1AE',
  },
  labelFull: {
    color: colors.neutral[500],
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    color: colors.warm.muted,
  },
});
