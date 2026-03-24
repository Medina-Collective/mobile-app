import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

export function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.button} hitSlop={12}>
      <Ionicons name="arrow-back" size={22} color={colors.beige[300]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing[2],
    marginLeft: spacing[6],
    width: spacing[10],
    height: spacing[10],
    justifyContent: 'center',
  },
});
