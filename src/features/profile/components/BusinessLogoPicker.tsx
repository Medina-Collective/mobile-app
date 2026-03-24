import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';

interface BusinessLogoPickerProps {
  businessName: string;
  logoUri?: string;
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
  onPress,
}: Readonly<BusinessLogoPickerProps>) {
  const initials = getInitials(businessName) || '?';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.circle}>
        <Text style={styles.initials}>{initials}</Text>
        <View style={styles.badge}>
          <Ionicons name="camera" size={14} color={colors.burgundy.deep} />
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
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.burgundy.raised,
    borderWidth: 2,
    borderColor: colors.burgundy.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#cdc1ad',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#cdc1ad',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.burgundy.deep,
  },
  hint: {
    color: colors.burgundy.muted,
  },
});
