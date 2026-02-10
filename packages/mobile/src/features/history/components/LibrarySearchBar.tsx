/**
 * Suchleiste für die Bibliothek
 */

import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Icons } from '@/shared/components/Icons';

interface LibrarySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function LibrarySearchBar({ value, onChangeText }: LibrarySearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-800/60 rounded-xl px-3 py-2.5 mb-3">
      <Icons.Search size={18} color="#9ca3af" />
      <TextInput
        className="flex-1 text-white text-sm ml-2.5"
        placeholder="Suche..."
        placeholderTextColor="#6b7280"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Icons.Close size={18} color="#9ca3af" />
        </Pressable>
      )}
    </View>
  );
}
