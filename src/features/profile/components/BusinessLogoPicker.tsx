import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';

interface BusinessLogoPickerProps {
  businessName: string;
  logoUri?: string | undefined;
  onPress: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function BusinessLogoPicker({
  businessName,
  logoUri,
  onPress,
}: Readonly<BusinessLogoPickerProps>) {
  const initials = getInitials(businessName) || '?';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.circleWrapper}>
        <View style={styles.circle}>
          {logoUri !== undefined && logoUri !== '' ? (
            <Image source={{ uri: logoUri }} style={styles.image} />
          ) : (
            <Text style={styles.initials}>{initials}</Text>
          )}
        </View>
        <View style={styles.badge}>
          <Ionicons name="camera" size={14} color="#ffffff" />
        </View>
      </TouchableOpacity>
      <Text variant="caption" style={styles.hint}>
        Tap to add logo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[8],
  },
  circleWrapper: {
    width: 96,
    height: 96,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff9f5',
    borderWidth: 2,
    borderColor: 'rgba(160, 122, 95, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 96,
    height: 96,
  },
  initials: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#2F0A0A',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2F0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#faf6f0',
  },
  hint: {
    color: 'rgba(26, 18, 18, 0.45)',
  },
});
