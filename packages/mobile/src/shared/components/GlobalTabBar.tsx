/**
 * Global Floating Tab Bar
 * Seitenübergreifend sichtbar auf allen Screens (außer Auth)
 * Bestimmt den aktiven Tab über useSegments/usePathname
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Icons } from './Icons';
import { useUIStore } from '../store/uiStore';

const ACTIVE_COLOR = '#6366f1';
const INACTIVE_COLOR = '#6b7280';

interface TabDef {
  route: string;
  icon: (props: { size: number; color: string }) => React.ReactNode;
  label: string;
  matchSegments: string[];
}

const TABS: TabDef[] = [
  {
    route: '/(tabs)',
    icon: (p) => <Icons.Camera {...p} />,
    label: 'Scan',
    matchSegments: ['(tabs)'],
  },
  {
    route: '/(tabs)/library',
    icon: (p) => <Icons.BookOpen {...p} />,
    label: 'Bibliothek',
    matchSegments: ['library', 'history'],
  },
  {
    route: '/(tabs)/profile',
    icon: (p) => <Icons.User {...p} />,
    label: 'Profil',
    matchSegments: ['profile'],
  },
];

/** Screens auf denen die Tab Bar nicht angezeigt wird */
const HIDDEN_SEGMENTS = ['login', 'register'];

function GlobalTabItem({
  tab,
  isFocused,
  onPress,
}: {
  tab: TabDef;
  isFocused: boolean;
  onPress: () => void;
}) {
  const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

  const animatedDot = useAnimatedStyle(() => ({
    opacity: withSpring(isFocused ? 1 : 0, { damping: 20, stiffness: 300 }),
    transform: [
      { scale: withSpring(isFocused ? 1 : 0.5, { damping: 20, stiffness: 300 }) },
    ],
  }));

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isFocused ? 1.1 : 1, { damping: 20, stiffness: 300 }) },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={animatedIcon}>
        {tab.icon({ size: 22, color })}
      </Animated.View>
      <Text
        style={[
          styles.label,
          { color, fontWeight: isFocused ? '600' : '400' },
        ]}
      >
        {tab.label}
      </Text>
      <Animated.View style={[styles.dot, { backgroundColor: ACTIVE_COLOR }, animatedDot]} />
    </Pressable>
  );
}

export function GlobalTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const tabBarHidden = useUIStore((s) => s.tabBarHidden);

  const firstSegment = segments[0] ?? '';
  const secondSegment = segments[1] ?? '';

  // Auf Auth-Screens ausblenden
  if (HIDDEN_SEGMENTS.includes(firstSegment)) return null;

  const bottomPadding = Math.max(insets.bottom - 8, 8);

  const getIsActive = (tab: TabDef): boolean => {
    if (firstSegment === 'history' && tab.matchSegments.includes('history')) {
      return true;
    }
    if (firstSegment === 'analyze' && tab.matchSegments.includes('(tabs)')) {
      return true;
    }
    if (firstSegment === '(tabs)') {
      if (!secondSegment && tab.matchSegments.includes('(tabs)')) return true;
      return tab.matchSegments.includes(secondSegment);
    }
    return false;
  };

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(tabBarHidden ? 120 : 0, { duration: tabBarHidden ? 250 : 180 }),
      },
    ],
    opacity: withTiming(tabBarHidden ? 0 : 1, { duration: tabBarHidden ? 200 : 120 }),
  }));

  return (
    <Animated.View
      style={[styles.container, { bottom: bottomPadding }, animatedContainer]}
      pointerEvents={tabBarHidden ? 'none' : 'box-none'}
    >
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        <View style={styles.inner}>
          {TABS.map((tab) => (
            <GlobalTabItem
              key={tab.route}
              tab={tab}
              isFocused={getIsActive(tab)}
              onPress={() => router.navigate(tab.route as never)}
            />
          ))}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    zIndex: 999,
  },
  blur: {
    flex: 1,
  },
  inner: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
