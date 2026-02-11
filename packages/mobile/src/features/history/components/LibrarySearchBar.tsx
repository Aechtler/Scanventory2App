/**
 * Kompakte Suchleiste mit integriertem Filter-Toggle
 */

import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { SortBy } from '../hooks/useLibraryFilters';

interface LibrarySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  // Filter props
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  sortBy: SortBy;
  onSelectSort: (sort: SortBy) => void;
  itemCount: number;
  filteredCount: number;
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
  small,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full mr-1.5 ${small ? 'px-2.5 py-1' : 'px-3 py-1.5'} ${
        active
          ? 'bg-primary-500/25 border border-primary-500/50'
          : 'bg-background-elevated/60 border border-transparent'
      }`}
    >
      <Text
        className={`font-medium ${small ? 'text-[11px]' : 'text-xs'} ${
          active ? 'text-primary-400' : 'text-foreground-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LibrarySearchBar({
  value,
  onChangeText,
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSort,
  itemCount,
  filteredCount,
}: LibrarySearchBarProps) {
  const colors = useThemeColors();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const isFiltered = selectedCategory !== null || sortBy !== 'newest';
  const hasActiveFilters = isFiltered || value.length > 0;

  return (
    <View className="px-4 pt-2 pb-1">
      {/* Suchleiste + Filter-Toggle in einer Zeile */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center bg-background-elevated/60 rounded-xl px-3 h-10">
          <Icons.Search size={16} color={colors.textSecondary} />
          <TextInput
            className="flex-1 text-foreground text-sm ml-2"
            placeholder="Suche..."
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={onChangeText}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {value.length > 0 && (
            <Pressable onPress={() => onChangeText('')} hitSlop={10}>
              <Icons.Close size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Filter Toggle */}
        <Pressable
          onPress={() => setFiltersExpanded(!filtersExpanded)}
          className={`h-10 w-10 rounded-xl items-center justify-center ${
            isFiltered
              ? 'bg-primary-500/25 border border-primary-500/50'
              : 'bg-background-elevated/60'
          }`}
        >
          <Icons.Stats size={18} color={isFiltered ? colors.primaryLight : colors.textSecondary} />
          {isFiltered && (
            <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 rounded-full" />
          )}
        </Pressable>
      </View>

      {/* Ausklappbare Filter */}
      {filtersExpanded && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          className="mt-2"
        >
          {/* Kategorie-Chips */}
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-1.5"
              contentContainerStyle={{ paddingRight: 8 }}
            >
              <Chip
                label="Alle"
                active={selectedCategory === null}
                onPress={() => onSelectCategory(null)}
                small
              />
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  active={selectedCategory === cat}
                  onPress={() =>
                    onSelectCategory(selectedCategory === cat ? null : cat)
                  }
                  small
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
                small
              />
            ))}
          </ScrollView>
        </MotiView>
      )}

      {/* Ergebnis-Count wenn gefiltert */}
      {hasActiveFilters && (
        <Text className="text-foreground-secondary text-[11px] mt-1.5 ml-1">
          {filteredCount} von {itemCount} Einträgen
        </Text>
      )}
    </View>
  );
}
