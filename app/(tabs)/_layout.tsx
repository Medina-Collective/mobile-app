import { StyleSheet, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@features/auth';
import { colors } from '@theme/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
}

function makeTabIcon(tab: TabConfig) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <View style={styles.iconWrapper}>
      {focused && <View style={styles.activeIndicator} />}
      <Ionicons name={focused ? tab.activeIcon : tab.inactiveIcon} size={size} color={color} />
    </View>
  );
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { name: 'discover', title: 'Discover', activeIcon: 'compass', inactiveIcon: 'compass-outline' },
  { name: 'favorites', title: 'Favorites', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
  { name: 'profile', title: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();

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
          height: 64,
          backgroundColor: 'rgba(250, 246, 240, 0.97)',
          borderTopWidth: 1,
          borderTopColor: colors.warm.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingTop: 10,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: makeTabIcon(tab),
          }}
        />
      ))}
      {/* Hidden routes */}
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
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
    top: -10,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#2F0A0A',
  },
});
