/**
 * Suchleiste für die Bibliothek
 */

import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface LibrarySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function LibrarySearchBar({ value, onChangeText }: LibrarySearchBarProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center bg-background-elevated/60 rounded-xl px-3 py-2.5 mb-3">
      <Icons.Search size={18} color={colors.textSecondary} />
      <TextInput
        className="flex-1 text-white text-sm ml-2.5"
        placeholder="Suche..."
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Icons.Close size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}
