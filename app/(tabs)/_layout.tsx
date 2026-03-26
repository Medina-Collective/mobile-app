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
    <Ionicons name={focused ? tab.activeIcon : tab.inactiveIcon} size={size} color={color} />
  );
}

const TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    name: 'discover',
    title: 'Discover',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
  },
  {
    name: 'search',
    title: 'Search',
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
  },
  {
    name: 'favorites',
    title: 'Favorites',
    activeIcon: 'heart',
    inactiveIcon: 'heart-outline',
  },
  {
    name: 'profile',
    title: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
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
        tabBarActiveTintColor: colors.burgundy.mid,
        tabBarInactiveTintColor: colors.warm.muted,
        tabBarStyle: {
          backgroundColor: colors.warm.elevated,
          borderTopColor: colors.warm.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
      {/* Hidden routes — registered so deep-links still work, but not shown in the tab bar */}
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
    </Tabs>
  );
}
