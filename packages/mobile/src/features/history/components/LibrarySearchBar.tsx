/**
 * Suchleiste mit kompakten Filter-Toggles und View-Toggle
 */

import { View, TextInput, Pressable, Text } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { CategoryDropdown } from './CategoryDropdown';
import type { SortBy } from '../hooks/useLibraryFilters';

export type ViewMode = 'list' | 'grid';

interface LibrarySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  categories: string[];
  selectedCategories: string[];
  onSelectCategories: (cats: string[]) => void;
  sortBy: SortBy;
  onSelectSort: (sort: SortBy) => void;
  itemCount: number;
  filteredCount: number;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
}

interface SortChipProps {
  label: string;
  active: boolean;
  direction?: 'asc' | 'desc';
  onPress: () => void;
}

function SortChip({ label, active, direction, onPress }: SortChipProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      className={`flex-row items-center gap-0.5 rounded-full px-3 py-2 mr-2 ${
        active
          ? 'bg-primary-500/25 border border-primary-500/50'
          : 'bg-background-elevated/60 border border-transparent'
      }`}
    >
      <Text className={`text-[13px] font-medium ${active ? 'text-primary-400' : 'text-foreground-secondary'}`}>
        {label}
      </Text>
      {direction === 'desc' && <Icons.ChevronDown size={12} color={active ? colors.primaryLight : colors.textSecondary} />}
      {direction === 'asc' && <Icons.ChevronUp size={12} color={active ? colors.primaryLight : colors.textSecondary} />}
    </Pressable>
  );
}

function getSortDirection(sortBy: SortBy, type: 'date' | 'price'): 'asc' | 'desc' {
  if (type === 'date') return sortBy === 'oldest' ? 'asc' : 'desc';
  return sortBy === 'price_asc' ? 'asc' : 'desc';
}

export function LibrarySearchBar({
  value,
  onChangeText,
  categories,
  selectedCategories,
  onSelectCategories,
  sortBy,
  onSelectSort,
  itemCount,
  filteredCount,
  viewMode,
  onToggleViewMode,
}: LibrarySearchBarProps) {
  const colors = useThemeColors();
  const hasActiveFilters = selectedCategories.length > 0 || value.length > 0;

  const handleNeuesteToggle = () => {
    if (sortBy === 'newest') onSelectSort('oldest');
    else onSelectSort('newest');
  };

  const handlePreisToggle = () => {
    if (sortBy === 'price_desc') onSelectSort('price_asc');
    else onSelectSort('price_desc');
  };

  const handleAzToggle = () => {
    if (sortBy === 'name') onSelectSort('newest');
    else onSelectSort('name');
  };

  return (
    <View className="px-5 pt-3 pb-2">
      {/* Zeile 1: Suche + View Toggle */}
      <View className="flex-row items-center gap-2.5 mb-2.5">
        <View className="flex-1 flex-row items-center bg-background-elevated/60 rounded-2xl px-4 h-11">
          <Icons.Search size={17} color={colors.textSecondary} />
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
              <Icons.Close size={17} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={onToggleViewMode}
          hitSlop={4}
          className="h-11 w-11 rounded-2xl items-center justify-center bg-background-elevated/60"
        >
          {viewMode === 'list' ? (
            <Icons.Grid size={19} color={colors.textSecondary} />
          ) : (
            <Icons.List size={19} color={colors.textSecondary} />
          )}
        </Pressable>
      </View>

      {/* Zeile 2: Kategorie-Dropdown + Sort-Toggles */}
      <View className="flex-row items-center flex-wrap gap-y-1.5">
        <View className="mr-2">
          <CategoryDropdown
            categories={categories}
            selectedCategories={selectedCategories}
            onSelectCategories={onSelectCategories}
          />
        </View>

        <SortChip
          label="Neueste"
          active={sortBy === 'newest' || sortBy === 'oldest'}
          direction={getSortDirection(sortBy, 'date')}
          onPress={handleNeuesteToggle}
        />
        <SortChip
          label="Preis"
          active={sortBy === 'price_asc' || sortBy === 'price_desc'}
          direction={getSortDirection(sortBy, 'price')}
          onPress={handlePreisToggle}
        />
        <SortChip
          label="A–Z"
          active={sortBy === 'name'}
          onPress={handleAzToggle}
        />
      </View>

      {hasActiveFilters && (
        <Text className="text-foreground-secondary text-xs mt-2 ml-0.5">
          {filteredCount} von {itemCount} Einträgen
        </Text>
      )}
    </View>
  );
}
