import { View, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Remove horizontal padding (useful for full-bleed layouts) */
  noHorizontalPadding?: boolean;
  /** Remove top safe area inset */
  noTopInset?: boolean;
  /**
   * 'light' — warm cream background (default, most screens)
   * 'dark'  — deep burgundy background (home feed, auth screens)
   */
  variant?: 'light' | 'dark';
}

export function Screen({
  children,
  style,
  noHorizontalPadding = false,
  noTopInset = false,
  variant = 'light',
}: ScreenProps) {
  const edges = noTopInset
    ? (['bottom', 'left', 'right'] as const)
    : (['top', 'bottom', 'left', 'right'] as const);

  return (
    <SafeAreaView
      style={[variant === 'dark' ? styles.safeDark : styles.safeLight, style]}
      edges={edges}
    >
      <View style={[styles.content, noHorizontalPadding && styles.noHorizontalPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeLight: {
    flex: 1,
    backgroundColor: colors.warm.bg,
  },
  safeDark: {
    flex: 1,
    backgroundColor: colors.burgundy.deep,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[24], // clear the floating tab bar (68px height + 24px offset)
  },
  noHorizontalPadding: {
    paddingHorizontal: 0,
  },
});
