import { useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@features/auth';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import { colors } from '@theme/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
}

function makeTabIcon(tab: TabConfig) {
  function TabIcon({
    focused,
    color,
    size,
  }: Readonly<{ focused: boolean; color: string; size: number }>) {
    return (
      <View style={styles.iconWrapper}>
        {focused && <View style={styles.activeIndicator} />}
        <Ionicons name={focused ? tab.activeIcon : tab.inactiveIcon} size={size} color={color} />
      </View>
    );
  }
  return TabIcon;
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { name: 'discover', title: 'Discover', activeIcon: 'compass', inactiveIcon: 'compass-outline' },
  { name: 'favorites', title: 'Favorites', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
  { name: 'profile', title: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

function NoLabel() {
  return null;
}

function CreateTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.createButton} activeOpacity={0.85}>
      <View style={styles.createButtonInner}>
        <Ionicons name="add" size={26} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isPro = useAuthStore(
    (s) => s.user?.role === USER_ROLES.PROFESSIONAL && s.activeView === 'professional',
  );
  const handleCreatePress = useCallback(() => router.push('/announcements/create'), [router]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2F0A0A',
        tabBarInactiveTintColor: 'rgba(26, 18, 18, 0.40)',
        tabBarStyle: {
          height: 56,
          backgroundColor: 'rgba(250, 246, 240, 0.97)',
          borderTopWidth: 1,
          borderTopColor: colors.warm.border,
          elevation: 0,
          shadowOpacity: 0,
          overflow: 'visible',
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: makeTabIcon(TABS[0]!) }} />
      <Tabs.Screen
        name="discover"
        options={{ title: 'Discover', tabBarIcon: makeTabIcon(TABS[1]!) }}
      />

      {/* Create — center raised button, pro only */}
      <Tabs.Screen
        name="create"
        options={
          isPro
            ? {
                title: '',
                tabBarLabel: NoLabel,
                tabBarItemStyle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
                tabBarButton: () => <CreateTabButton onPress={handleCreatePress} />,
              }
            : { href: null }
        }
      />

      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favorites', tabBarIcon: makeTabIcon(TABS[2]!) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: makeTabIcon(TABS[3]!) }}
      />

      {/* Hidden routes */}
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -13,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#2F0A0A',
  },
  createButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
  },
  createButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2F0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F0A0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
