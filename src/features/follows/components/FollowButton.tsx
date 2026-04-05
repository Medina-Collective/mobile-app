import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
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

  // Pill variant: filled dark = default "Follow", outline = "Following"
  return (
    <TouchableOpacity
      onPress={toggle}
      disabled={isToggling}
      style={[styles.pill, isFollowing ? styles.pillFollowing : styles.pillDefault]}
      activeOpacity={0.8}
    >
      {isToggling ? (
        <ActivityIndicator size="small" color={isFollowing ? colors.warm.title : '#ffffff'} />
      ) : (
        <View style={styles.pillContent}>
          <Ionicons
            name={isFollowing ? 'checkmark' : 'people-outline'}
            size={15}
            color={isFollowing ? colors.warm.title : '#ffffff'}
          />
          <Text
            style={[
              styles.pillLabel,
              isFollowing ? styles.pillLabelFollowing : styles.pillLabelDefault,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </View>
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
    borderRadius: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  pillDefault: {
    backgroundColor: colors.burgundy.deep,
    borderWidth: 0,
  },
  pillFollowing: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.warm.border,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillLabelDefault: {
    color: '#ffffff',
  },
  pillLabelFollowing: {
    color: colors.warm.title,
  },
});
