import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_BASE_HEIGHT = 72; // 44 min height + 14 * 2 paddingVertical

/**
 * Returns the total height of the global tab bar, including the bottom safe area inset.
 * Use this to set `paddingBottom` on ScrollViews or FlatLists so the last items
 * are not obstructed by the translucent tab bar when scrolled to the end.
 */
export function useTabBarPadding(additionalPadding: number = 20) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE_HEIGHT + insets.bottom + additionalPadding;
}
