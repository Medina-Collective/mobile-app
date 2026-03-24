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
  variant?: ButtonVariant | undefined;
  loading?: boolean | undefined;
  style?: ViewStyle | undefined;
}

export function Button({
  title,
  variant = 'solid',
  loading = false,
  style,
  disabled,
  ...props
}: Readonly<ButtonProps>) {
  const isDisabled = disabled === true || loading;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'solid' ? colors.neutral[0] : colors.neutral[900]}
          size="small"
        />
      ) : (
        <Text
          variant="label"
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
    height: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  solid: {
    backgroundColor: colors.neutral[900],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral[900],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
    color: colors.neutral[0],
    letterSpacing: 0.8,
    fontSize: 13,
  },
  labelAlt: {
    color: colors.neutral[900],
  },
});
