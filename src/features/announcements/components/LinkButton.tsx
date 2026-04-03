import { TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/colors';

interface LinkButtonProps {
  url: string;
  size?: number;
}

export function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

export function LinkButton({ url, size = 44 }: Readonly<LinkButtonProps>) {
  return (
    <TouchableOpacity
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      activeOpacity={0.7}
      onPress={() => Linking.openURL(normalizeUrl(url))}
    >
      <Ionicons name="open-outline" size={size * 0.45} color={colors.warm.title} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
