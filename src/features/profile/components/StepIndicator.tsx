import { View, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

const STEP_LABELS = [
  'Profile Type',
  'Category',
  'Subcategory',
  'Service Type',
  'Location',
  'About & Contact',
  'Review',
];

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: Readonly<StepIndicatorProps>) {
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {STEP_LABELS.slice(0, totalSteps).map((label, index) => (
          <View
            key={label}
            style={[styles.bar, index <= currentStep ? styles.barActive : styles.barInactive]}
          />
        ))}
      </View>
      <Text variant="caption" style={styles.label}>
        {STEP_LABELS[currentStep]} · {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[8],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[2],
  },
  bars: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  barActive: {
    backgroundColor: '#CEC1AE',
  },
  barInactive: {
    backgroundColor: colors.burgundy.raised,
  },
  label: {
    color: colors.burgundy.muted,
    letterSpacing: 0.3,
  },
});
