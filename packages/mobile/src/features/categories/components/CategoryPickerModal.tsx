import { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { Icons } from '@/shared/components/Icons';
import { useCategories } from '../hooks/useCategories';
import { CategoryBreadcrumb } from './CategoryBreadcrumb';
import { CategoryLevelList } from './CategoryLevelList';
import type { CategoryNode } from '../types';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  /** Gibt den gewählten Node + Pfad-String zurück */
  onSelect: (node: CategoryNode, pathString: string) => void;
  selectedId?: string | null;
}

export function CategoryPickerModal({
  visible,
  onClose,
  onSelect,
  selectedId,
}: CategoryPickerModalProps) {
  const colors = useThemeColors();
  const { tree, createCategory } = useCategories();
  const [path, setPath] = useState<CategoryNode[]>([]);

  const currentItems = path.length === 0 ? tree : path[path.length - 1].children;
  const currentParentId = path.length === 0 ? null : path[path.length - 1].id;

  function handleDrillDown(node: CategoryNode) {
    setPath((prev) => [...prev, node]);
  }

  function handleNavigate(index: number) {
    if (index === -1) {
      setPath([]);
    } else {
      setPath((prev) => prev.slice(0, index + 1));
    }
  }

  function handleSelect(node: CategoryNode) {
    const segments = [...path.map((n) => n.name), node.name];
    onSelect(node, segments.join(' > '));
    setPath([]);
    onClose();
  }

  function handleClose() {
    setPath([]);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-background-card rounded-t-3xl" style={{ maxHeight: '80%' }}>
          {/* Header */}
          <View className="flex-row items-center px-5 pt-5 pb-2">
            <View className="w-10 h-1 bg-foreground-secondary/30 rounded-full absolute self-center top-2 left-0 right-0 mx-auto" />
            <Text className="flex-1 text-foreground text-lg font-bold">Kategorie wählen</Text>
            <Pressable onPress={handleClose} className="p-1 -mr-1">
              <Icons.Close size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Breadcrumb */}
          <View className="px-3 border-b border-border/40">
            <CategoryBreadcrumb path={path} onNavigate={handleNavigate} />
          </View>

          {/* Hinweis: Lang-Drücken wählt direkt */}
          {currentItems.some((n) => n.children.length > 0) && (
            <View className="px-4 py-2 bg-background-elevated/30">
              <Text className="text-foreground-secondary text-xs">
                Tippen zum Weiternavigieren · Lang drücken zum direkten Auswählen
              </Text>
            </View>
          )}

          {/* Kategorie-Liste */}
          <CategoryLevelList
            items={currentItems}
            selectedId={selectedId}
            parentId={currentParentId}
            onSelect={handleSelect}
            onDrillDown={handleDrillDown}
            onCreate={createCategory}
          />
        </View>
      </View>
    </Modal>
  );
}
