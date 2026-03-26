import { StyleSheet, View, Platform } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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

function GlassTabBar() {
  return (
    <View style={styles.blurWrapper} pointerEvents="none">
      <BlurView
        intensity={60}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      {/* warm tint overlay */}
      <View style={[StyleSheet.absoluteFill, styles.tintOverlay]} />
      {/* top highlight edge — the "glass" catch-light */}
      <View style={[StyleSheet.absoluteFill, styles.glassHighlight]} />
    </View>
  );
}

const TABS: TabConfig[] = [
  { name: 'index',    title: 'Home',      activeIcon: 'home',      inactiveIcon: 'home-outline' },
  { name: 'discover', title: 'Discover',  activeIcon: 'compass',   inactiveIcon: 'compass-outline' },
  { name: 'search',   title: 'Search',    activeIcon: 'search',    inactiveIcon: 'search-outline' },
  { name: 'favorites',title: 'Favorites', activeIcon: 'heart',     inactiveIcon: 'heart-outline' },
  { name: 'profile',  title: 'Profile',   activeIcon: 'person',    inactiveIcon: 'person-outline' },
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
        tabBarBackground: () => <GlassTabBar />,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 68,
          borderRadius: 34,
          backgroundColor: Platform.OS === 'android' ? 'rgba(250, 246, 240, 0.97)' : 'transparent',
          borderTopWidth: 0,
          // shadow
          shadowColor: colors.warm.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 24,
          elevation: 12,
          overflow: 'hidden',
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 2,
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
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurWrapper: {
    flex: 1,
    borderRadius: 34,
    overflow: 'hidden',
  },
  tintOverlay: {
    backgroundColor: 'rgba(250, 246, 240, 0.70)',
    borderRadius: 34,
  },
  glassHighlight: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(160, 122, 95, 0.2)',
    // inner top highlight
    borderTopColor: 'rgba(160, 122, 95, 0.30)',
  },
});
