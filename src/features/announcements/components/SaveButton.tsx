import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSavedStore } from '@store/saved.store';
import { useRecommendationsStore } from '@store/recommendations.store';
import { colors } from '@theme/colors';
import type { AnnouncementType } from '@app-types/announcement';

interface SaveButtonProps {
  announcementId: string;
  announcementType: AnnouncementType;
  iconType?: 'heart' | 'bookmark';
}

export function SaveButton({
  announcementId,
  announcementType,
  iconType = 'heart',
}: Readonly<SaveButtonProps>) {
  const isSaved = useSavedStore((s) => s.isSaved(announcementId));
  const toggle = useSavedStore((s) => s.toggle);
  const recordSignal = useRecommendationsStore((s) => s.recordSignal);

  let iconName: 'bookmark' | 'bookmark-outline' | 'heart' | 'heart-outline';
  if (iconType === 'bookmark') {
    iconName = isSaved ? 'bookmark' : 'bookmark-outline';
  } else {
    iconName = isSaved ? 'heart' : 'heart-outline';
  }

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => {
        if (!isSaved) recordSignal(announcementType, 'save');
        toggle(announcementId);
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={iconName}
        size={18}
        color={isSaved ? colors.burgundy.mid : colors.warm.muted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
  },
});
