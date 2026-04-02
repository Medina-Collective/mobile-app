import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useFollow } from '../hooks/useFollow';

interface FollowButtonProps {
  professionalId: string;
  /** 'pill' = labelled button (detail screen), 'icon' = icon-only (cards) */
  variant?: 'pill' | 'icon';
}

export function FollowButton({ professionalId, variant = 'pill' }: Readonly<FollowButtonProps>) {
  const { isFollowing, toggle, isToggling } = useFollow(professionalId);

  if (variant === 'icon') {
    const iconName = isFollowing ? 'person-remove-outline' : 'person-add-outline';
    const iconColor = isFollowing ? colors.burgundy.muted : '#CEC1AE';
    return (
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          toggle();
        }}
        disabled={isToggling}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.iconBtn}
        activeOpacity={0.7}
      >
        {isToggling ? (
          <ActivityIndicator size="small" color={colors.burgundy.muted} />
        ) : (
          <Ionicons name={iconName} size={18} color={iconColor} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={toggle}
      disabled={isToggling}
      style={[styles.pill, isFollowing && styles.pillFollowing]}
      activeOpacity={0.8}
    >
      {isToggling ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? '#fff' : colors.burgundy.deep}
        />
      ) : (
        <Text style={[styles.pillLabel, isFollowing && styles.pillLabelFollowing]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.burgundy.deep,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  pillFollowing: {
    backgroundColor: colors.burgundy.deep,
    borderColor: colors.burgundy.deep,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.burgundy.deep,
  },
  pillLabelFollowing: {
    color: '#fff',
  },
});
