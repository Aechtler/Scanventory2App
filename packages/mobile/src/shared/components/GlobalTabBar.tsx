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
  useSharedValue,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Icons } from './Icons';
import { useUIStore } from '../store/uiStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResolvedColorScheme } from '../store/themeStore';
import { TAB_BAR_COLORS } from '../constants';
import { useCampaignStore } from '../../features/campaigns/store/campaignStore';

interface TabDef {
  route: string;
  icon: (props: { size: number; color: string }) => React.ReactNode;
  label: string;
  matchSegments: string[];
  badge?: () => number;
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
    label: 'Verlauf',
    matchSegments: ['library', 'history'],
  },
  {
    route: '/campaigns',
    icon: (p) => <Icons.Flag {...p} />,
    label: 'Kampagnen',
    matchSegments: ['campaigns'],
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
  badge,
  triggerBounce,
  onBounceComplete,
}: {
  tab: TabDef;
  isFocused: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  badge?: number;
  triggerBounce?: boolean;
  onBounceComplete?: () => void;
}) {
  const color = isFocused ? activeColor : inactiveColor;
  const pressed = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (!triggerBounce) return;
    rippleScale.value = 0.25;
    rippleOpacity.value = 0.75;
    rippleScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    rippleOpacity.value = withSequence(
      withTiming(0.75, { duration: 80 }),
      withTiming(0, { duration: 580 }, (finished) => {
        if (finished && onBounceComplete) runOnJS(onBounceComplete)();
      }),
    );
  }, [triggerBounce]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.80]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.5]),
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
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
      <Animated.View style={pressStyle}>
        <View style={styles.iconWrap}>
          <Animated.View style={[styles.ripple, rippleStyle, { borderColor: activeColor }]} />
          {tab.icon({ size: 28, color })}
          {badge != null && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          )}
        </View>
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
  const campaignCount = useCampaignStore((s) => s.campaigns.length);
  const lastCreated = useCampaignStore((s) => s.lastCreated);
  const clearLastCreated = useCampaignStore((s) => s.clearLastCreated);

  const firstSegment = segments[0] ?? '';
  const secondSegment = segments[1] ?? '';

  const inactiveColor = scheme === 'dark'
    ? TAB_BAR_COLORS.inactiveDark
    : TAB_BAR_COLORS.inactiveLight;

  const getIsActive = (tab: TabDef): boolean => {
    if (firstSegment === 'history' && tab.matchSegments.includes('history')) return true;
    if (firstSegment === 'campaigns' && tab.matchSegments.includes('campaigns')) return true;
    if (firstSegment === 'analyze' && tab.matchSegments.includes('(tabs)')) return true;
    if (firstSegment === '(tabs)') {
      if (!secondSegment && tab.matchSegments.includes('(tabs)')) return true;
      return tab.matchSegments.includes(secondSegment);
    }
    return false;
  };

  // Hide on auth screens (use style instead of early return to keep hook count stable)
  const isHiddenScreen = HIDDEN_SEGMENTS.includes(firstSegment);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(tabBarHidden ? 120 : 0, { duration: tabBarHidden ? 250 : 180 }),
      },
    ],
    opacity: withTiming(tabBarHidden ? 0 : 1, { duration: tabBarHidden ? 200 : 120 }),
  }));

  if (isHiddenScreen) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: 0,
          shadowColor: colors.primary,
          borderColor: scheme === 'dark'
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(0, 0, 0, 0.08)',
        },
        animatedContainer,
      ]}
      pointerEvents={tabBarHidden ? 'none' : 'box-none'}
    >
      <BlurView intensity={75} tint={scheme} style={styles.blur}>
        <View style={[styles.inner, { backgroundColor: colors.tabBarBackground, paddingBottom: insets.bottom }]}>
          {TABS.map((tab) => (
            <GlobalTabItem
              key={tab.route}
              tab={tab}
              isFocused={getIsActive(tab)}
              onPress={() => {
                if (tab.route === '/(tabs)') {
                  useUIStore.getState().setScanMenuVisible(true);
                } else if (tab.route === '/(tabs)/library' && (firstSegment === 'history' || secondSegment === 'library')) {
                  router.navigate('/(tabs)/library');
                } else {
                  router.navigate(tab.route as never);
                }
              }}
              activeColor={colors.primary}
              inactiveColor={inactiveColor}
              badge={tab.route === '/campaigns' ? campaignCount : undefined}
              triggerBounce={tab.route === '/campaigns' ? lastCreated !== null : undefined}
              onBounceComplete={tab.route === '/campaigns' ? clearLastCreated : undefined}
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
  iconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    top: -21,
    left: -21,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
});
