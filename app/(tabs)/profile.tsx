import { View, StyleSheet } from 'react-native';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="heading2">Profile</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <Text variant="heading3" style={styles.avatarInitial}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text variant="heading4">{user?.displayName ?? '—'}</Text>
        <Text variant="body" style={styles.email}>
          {user?.email ?? '—'}
        </Text>
        <View style={styles.roleBadge}>
          <Text variant="caption" style={styles.roleText}>
            {user?.role ?? 'user'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Sign Out"
          variant="outline"
          onPress={() => void signOut()}
          style={styles.signOutButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  avatarSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing[10],
    gap: spacing[2],
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.burgundy.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  avatarInitial: {
    color: colors.beige[200],
  },
  email: {
    color: colors.neutral[500],
  },
  roleBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.burgundy.raised,
    borderRadius: 20,
  },
  roleText: {
    color: colors.beige[300],
    textTransform: 'capitalize',
  },
  footer: {
    paddingBottom: spacing[4],
  },
  signOutButton: {
    width: '100%',
  },
});
