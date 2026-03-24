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

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const hasError = error !== undefined && error.length > 0;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label !== undefined && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, hasError && styles.inputError, style]}
        placeholderTextColor={colors.neutral[400]}
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
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[1],
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    paddingHorizontal: spacing[4],
    fontSize: fontSize.base,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    marginTop: spacing[1],
    color: colors.error[500],
  },
});
