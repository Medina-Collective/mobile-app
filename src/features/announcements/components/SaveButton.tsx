import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSavedStore } from '@store/saved.store';
import { colors } from '@theme/colors';

interface SaveButtonProps {
  announcementId: string;
}

export function SaveButton({ announcementId }: Readonly<SaveButtonProps>) {
  const isSaved = useSavedStore((s) => s.isSaved(announcementId));
  const toggle = useSavedStore((s) => s.toggle);

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => toggle(announcementId)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isSaved ? 'bookmark' : 'bookmark-outline'}
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
