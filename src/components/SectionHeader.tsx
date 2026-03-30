import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, subtitle, onSeeAll }: Readonly<SectionHeaderProps>) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle !== undefined && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {onSeeAll !== undefined && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.75}>
          <View style={styles.seeAllRow}>
            <Text style={styles.seeAll}>See all</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.burgundy.mid} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  title: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 20,
    color: colors.warm.title,
  },
  subtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    color: colors.warm.muted,
    marginTop: 2,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 1,
  },
  seeAll: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 13,
    color: colors.burgundy.mid,
  },
});
