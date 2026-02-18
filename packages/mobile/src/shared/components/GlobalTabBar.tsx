/**
 * Global Floating Tab Bar
 * Seitenübergreifend sichtbar auf allen Screens (außer Auth)
 * Bestimmt den aktiven Tab über useSegments/usePathname
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Icons } from './Icons';
import { useUIStore } from '../store/uiStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResolvedColorScheme } from '../store/themeStore';

const INACTIVE_COLOR_LIGHT = '#9ca3af';
const INACTIVE_COLOR_DARK = '#6b7280';

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
  activeColor,
  inactiveColor,
}: {
  tab: TabDef;
  isFocused: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  const color = isFocused ? activeColor : inactiveColor;
  const pressed = useSharedValue(0);

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, 0.80]) },
    ],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.5]),
  }));

  return (
    <Pressable
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 70, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
      }}
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={animatedIcon}>
        {tab.icon({ size: 28, color })}
      </Animated.View>
    </Pressable>
  );
}

export function GlobalTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const tabBarHidden = useUIStore((s) => s.tabBarHidden);
  const colors = useThemeColors();
  const scheme = useResolvedColorScheme();

  const firstSegment = segments[0] ?? '';
  const secondSegment = segments[1] ?? '';

  // Auf Auth-Screens ausblenden
  if (HIDDEN_SEGMENTS.includes(firstSegment)) return null;

  const inactiveColor = scheme === 'dark' ? INACTIVE_COLOR_DARK : INACTIVE_COLOR_LIGHT;

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
      style={[
        styles.container,
        {
          bottom: 0,
          paddingBottom: insets.bottom,
          shadowColor: colors.primary,
          borderColor: scheme === 'dark'
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(0, 0, 0, 0.08)',
        },
        animatedContainer,
      ]}
      pointerEvents={tabBarHidden ? 'none' : 'box-none'}
    >
      <BlurView intensity={60} tint={scheme} style={styles.blur}>
        <View style={[styles.inner, { backgroundColor: colors.tabBarBackground }]}>
          {TABS.map((tab) => (
            <GlobalTabItem
              key={tab.route}
              tab={tab}
              isFocused={getIsActive(tab)}
              onPress={() => router.navigate(tab.route as never)}
              activeColor={colors.primary}
              inactiveColor={inactiveColor}
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
    left: 0,
    right: 0,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 999,
  },
  blur: {
    flex: 1,
  },
  inner: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
