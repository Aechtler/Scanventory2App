/**
 * Suchleiste mit Filter- und View-Toggle
 */

import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { SortBy } from '../hooks/useLibraryFilters';

export type ViewMode = 'list' | 'grid';

interface LibrarySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  sortBy: SortBy;
  onSelectSort: (sort: SortBy) => void;
  itemCount: number;
  filteredCount: number;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
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
      hitSlop={4}
      className={`rounded-full mr-2 px-4 py-2 ${
        active
          ? 'bg-primary-500/25 border border-primary-500/50'
          : 'bg-background-elevated/60 border border-transparent'
      }`}
    >
      <Text
        className={`font-medium text-[13px] ${
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
  viewMode,
  onToggleViewMode,
}: LibrarySearchBarProps) {
  const colors = useThemeColors();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const isFiltered = selectedCategory !== null || sortBy !== 'newest';
  const hasActiveFilters = isFiltered || value.length > 0;

  return (
    <View className="px-5 pt-4 pb-2">
      <View className="flex-row items-center gap-2.5">
        {/* Suchfeld */}
        <View className="flex-1 flex-row items-center bg-background-elevated/60 rounded-2xl px-4 h-12">
          <Icons.Search size={18} color={colors.textSecondary} />
          <TextInput
            className="flex-1 text-foreground text-[15px] ml-2.5"
            placeholder="Suche..."
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={onChangeText}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {value.length > 0 && (
            <Pressable onPress={() => onChangeText('')} hitSlop={12}>
              <Icons.Close size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* View Toggle */}
        <Pressable
          onPress={onToggleViewMode}
          hitSlop={4}
          className="h-12 w-12 rounded-2xl items-center justify-center bg-background-elevated/60"
        >
          {viewMode === 'list' ? (
            <Icons.Grid size={20} color={colors.textSecondary} />
          ) : (
            <Icons.List size={20} color={colors.textSecondary} />
          )}
        </Pressable>

        {/* Filter Toggle */}
        <Pressable
          onPress={() => setFiltersExpanded(!filtersExpanded)}
          hitSlop={4}
          className={`h-12 w-12 rounded-2xl items-center justify-center ${
            isFiltered
              ? 'bg-primary-500/25 border border-primary-500/50'
              : 'bg-background-elevated/60'
          }`}
        >
          <Icons.Stats size={20} color={isFiltered ? colors.primaryLight : colors.textSecondary} />
          {isFiltered && (
            <View className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary-500 rounded-full" />
          )}
        </Pressable>
      </View>

      {/* Ausklappbare Filter */}
      {filtersExpanded && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          className="mt-3"
        >
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
              contentContainerStyle={{ paddingRight: 12 }}
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 12 }}
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
        </MotiView>
      )}

      {hasActiveFilters && (
        <Text className="text-foreground-secondary text-xs mt-2 ml-1">
          {filteredCount} von {itemCount} Einträgen
        </Text>
      )}
    </View>
  );
}
