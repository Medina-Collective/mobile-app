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
}

export function Screen({
  children,
  style,
  noHorizontalPadding = false,
  noTopInset = false,
}: ScreenProps) {
  const edges = noTopInset
    ? (['bottom', 'left', 'right'] as const)
    : (['top', 'bottom', 'left', 'right'] as const);

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <View style={[styles.content, noHorizontalPadding && styles.noHorizontalPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  noHorizontalPadding: {
    paddingHorizontal: 0,
  },
});
