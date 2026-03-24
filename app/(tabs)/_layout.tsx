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

const TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    name: 'events',
    title: 'Events',
    activeIcon: 'calendar',
    inactiveIcon: 'calendar-outline',
  },
  {
    name: 'discover',
    title: 'Discover',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
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
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.neutral[0],
          borderTopColor: colors.neutral[200],
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.inactiveIcon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
