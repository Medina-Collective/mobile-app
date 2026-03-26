import { useState } from 'react';
import { View, TextInput, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';

interface InputProps extends TextInputProps {
  label?: string | undefined;
  error?: string | undefined;
  containerStyle?: ViewStyle | undefined;
  /** 'dark' keeps legacy beige text for use on dark/burgundy backgrounds (auth screens) */
  variant?: 'light' | 'dark' | undefined;
}

export function Input({
  label,
  error,
  containerStyle,
  variant = 'light',
  style,
  onFocus,
  onBlur,
  ...props
}: Readonly<InputProps>) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = error !== undefined && error.length > 0;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label !== undefined && (
        <Text variant="overline" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          variant === 'dark' ? styles.inputDark : styles.inputLight,
          isFocused && (variant === 'dark' ? styles.inputDarkFocused : styles.inputLightFocused),
          hasError && styles.inputError,
          style,
        ]}
        placeholderTextColor={variant === 'dark' ? '#7b625b' : colors.warm.muted}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {hasError && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[6],
  },
  label: {
    marginBottom: spacing[2],
    color: '#7b625b',
  },
  input: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#7b625b',
    paddingHorizontal: 0,
    paddingVertical: spacing[2],
    fontSize: fontSize.base,
    backgroundColor: 'transparent',
  },
  inputLight: {
    color: colors.warm.title,
    borderBottomColor: colors.warm.muted,
  },
  inputLightFocused: {
    borderBottomColor: colors.burgundy.mid,
  },
  inputDark: {
    color: '#cdc1ad',
    borderBottomColor: '#7b625b',
  },
  inputDarkFocused: {
    borderBottomColor: '#cdc1ad',
  },
  inputError: {
    borderBottomColor: colors.error[500],
  },
  errorText: {
    marginTop: spacing[1],
    color: colors.error[500],
  },
});
