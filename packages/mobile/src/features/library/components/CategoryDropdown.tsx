/**
 * Multiselect-Dropdown für Kategoriefilter
 */

import { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface Props {
  categories: string[];
  selectedCategories: string[];
  onSelectCategories: (cats: string[]) => void;
}

export function CategoryDropdown({ categories, selectedCategories, onSelectCategories }: Props) {
  const [open, setOpen] = useState(false);
  const colors = useThemeColors();

  const allSelected = selectedCategories.length === 0;

  const label = allSelected
    ? 'Alle'
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : `${selectedCategories.length} Kat.`;

  const isActive = !allSelected;

  const toggleAll = () => onSelectCategories([]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onSelectCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      const next = [...selectedCategories, cat];
      onSelectCategories(next.length === categories.length ? [] : next);
    }
  };

  if (categories.length === 0) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={4}
        className={`flex-row items-center gap-1 rounded-full px-3 py-2 ${
          isActive
            ? 'bg-primary-500/25 border border-primary-500/50'
            : 'bg-background-elevated/60 border border-transparent'
        }`}
      >
        <Text
          className={`text-[13px] font-medium ${isActive ? 'text-primary-400' : 'text-foreground-secondary'}`}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Icons.ChevronDown size={13} color={isActive ? colors.primaryLight : colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-background-card rounded-t-2xl pb-8 pt-4"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between px-5 mb-3">
              <Text className="text-foreground text-base font-semibold">Kategorien</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Icons.Close size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView>
              {/* Alle */}
              <Pressable
                onPress={toggleAll}
                className="flex-row items-center justify-between px-5 py-3"
              >
                <Text className="text-foreground text-[15px]">Alle</Text>
                {allSelected && <Icons.Check size={18} color={colors.primary} />}
              </Pressable>

              <View className="h-px bg-background-elevated mx-5 mb-1" />

              {/* Einzelne Kategorien */}
              {categories.map((cat) => {
                const checked = selectedCategories.includes(cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => toggleCategory(cat)}
                    className="flex-row items-center justify-between px-5 py-3"
                  >
                    <Text className="text-foreground text-[15px]">{cat}</Text>
                    {checked && <Icons.Check size={18} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
