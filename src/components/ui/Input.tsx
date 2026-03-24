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
}

export function Input({
  label,
  error,
  containerStyle,
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
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          style,
        ]}
        placeholderTextColor="#7b625b"
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
    color: '#cdc1ad',
    backgroundColor: 'transparent',
  },
  inputFocused: {
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
