import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type ButtonVariant = 'solid' | 'outline' | 'ghost';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'solid',
  loading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'solid' ? colors.neutral[0] : colors.primary[500]}
          size="small"
        />
      ) : (
        <Text
          variant="bodyBold"
          style={[styles.label, variant !== 'solid' && styles.labelAlt]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  solid: {
    backgroundColor: colors.primary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.neutral[0],
  },
  labelAlt: {
    color: colors.primary[500],
  },
});
