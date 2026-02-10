/**
 * Filter-Chips für Kategorie und Sortierung
 */

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import type { SortBy } from '../hooks/useLibraryFilters';

interface LibraryFilterBarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  sortBy: SortBy;
  onSelectSort: (sort: SortBy) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'newest', label: 'Neueste' },
  { value: 'price_desc', label: 'Preis ↓' },
  { value: 'price_asc', label: 'Preis ↑' },
  { value: 'name', label: 'A–Z' },
];

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1.5 rounded-lg border mr-2 ${
        active
          ? 'bg-primary-500/20 border-primary-500/50'
          : 'bg-gray-800 border-gray-700'
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          active ? 'text-primary-400' : 'text-gray-400'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LibraryFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSort,
}: LibraryFilterBarProps) {
  return (
    <View className="mb-3 gap-2">
      {/* Kategorie-Chips */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          <Chip
            label="Alle"
            active={selectedCategory === null}
            onPress={() => onSelectCategory(null)}
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={selectedCategory === cat}
              onPress={() =>
                onSelectCategory(selectedCategory === cat ? null : cat)
              }
            />
          ))}
        </ScrollView>
      )}

      {/* Sortier-Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        {SORT_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={sortBy === opt.value}
            onPress={() => onSelectSort(opt.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
