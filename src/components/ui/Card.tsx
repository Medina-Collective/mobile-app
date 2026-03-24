import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

interface CardProps extends ViewProps {
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export function Card({ padding = 4, style, children, ...props }: CardProps) {
  return (
    <View style={[styles.card, { padding: spacing[padding] }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
