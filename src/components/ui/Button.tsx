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
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'solid' ? colors.burgundy.deep : colors.beige[200]}
          size="small"
        />
      ) : (
        <Text variant="label" style={[styles.label, variant !== 'solid' && styles.labelAlt]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/* eslint-disable react-native/no-unused-styles -- solid/outline/ghost accessed dynamically via styles[variant] */
const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  /** Warm beige fill — the primary welcoming CTA */
  solid: {
    backgroundColor: colors.beige[200],
  },
  /** Subtle merlot border — secondary action */
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.burgundy.deep,
    letterSpacing: 0.5,
    fontSize: 14,
    fontWeight: '700',
  },
  labelAlt: {
    color: colors.beige[300],
    fontWeight: '400',
  },
});
