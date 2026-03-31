import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';

/** Shared styles for horizontal filter chip rows used across Home, Discover, and Favorites. */
export const filterChipStyles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
  },
  chipActive: {
    backgroundColor: '#2F0A0A',
    borderColor: '#2F0A0A',
  },
  chipLabel: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: colors.warm.title,
  },
  chipLabelActive: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: '#ffffff',
  },
});
