/**
 * ThemeSelector - Segmented Control für Light/Dark/System
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icons } from './Icons';
import { useThemeStore } from '../store/themeStore';
import { useThemeColors } from '../hooks/useThemeColors';

type ThemeMode = 'light' | 'dark' | 'system';

const OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Icons }[] = [
  { mode: 'light', label: 'Hell', icon: 'Sun' },
  { mode: 'dark', label: 'Dunkel', icon: 'Moon' },
  { mode: 'system', label: 'System', icon: 'Smartphone' },
];

export function ThemeSelector() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const colors = useThemeColors();

  return (
    <View className="flex-row rounded-xl overflow-hidden border border-border">
      {OPTIONS.map(({ mode, label, icon }) => {
        const isActive = theme === mode;
        const Icon = Icons[icon];
        return (
          <Pressable
            key={mode}
            onPress={() => setTheme(mode)}
            className={`flex-1 flex-row items-center justify-center py-3 gap-2 ${
              isActive ? 'bg-primary/15' : ''
            }`}
          >
            <Icon
              size={16}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={{
                color: isActive ? colors.primary : colors.textSecondary,
                fontWeight: isActive ? '600' : '400',
                fontSize: 13,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
