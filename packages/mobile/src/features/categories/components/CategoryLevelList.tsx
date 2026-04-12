import { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { CategoryNode, CreateCategoryPayload } from '../types/category.types';

interface CategoryLevelListProps {
  items: CategoryNode[];
  selectedId?: string | null;
  parentId: string | null;
  onSelect: (node: CategoryNode) => void;
  onDrillDown: (node: CategoryNode) => void;
  onCreate: (payload: CreateCategoryPayload) => Promise<CategoryNode | null>;
}

export function CategoryLevelList({
  items,
  selectedId,
  parentId,
  onSelect,
  onDrillDown,
  onCreate,
}: CategoryLevelListProps) {
  const colors = useThemeColors();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    const created = await onCreate({ name, parentId });
    setSaving(false);
    if (created) {
      setNewName('');
      setAdding(false);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {items.map((node) => {
        const isSelected = node.id === selectedId;
        const hasChildren = node.children.length > 0;

        return (
          <Pressable
            key={node.id}
            onPress={() => (hasChildren ? onDrillDown(node) : onSelect(node))}
            onLongPress={() => onSelect(node)}
            className={`flex-row items-center px-4 py-3.5 border-b border-border/40 active:bg-background-elevated/50 ${
              isSelected ? 'bg-primary/10' : ''
            }`}
          >
            <Text
              className={`flex-1 text-base ${isSelected ? 'text-primary-400 font-semibold' : 'text-foreground'}`}
              numberOfLines={1}
            >
              {node.name}
            </Text>

            <View className="flex-row items-center gap-2">
              {isSelected && <Icons.Check size={16} color={colors.primary} />}
              {hasChildren && (
                <Icons.ChevronRight size={18} color={colors.textSecondary} />
              )}
            </View>
          </Pressable>
        );
      })}

      {/* "+" Neue Unterkategorie */}
      {adding ? (
        <View className="flex-row items-center px-4 py-2 gap-2">
          <TextInput
            autoFocus
            value={newName}
            onChangeText={setNewName}
            placeholder="Name eingeben..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={handleCreate}
            returnKeyType="done"
            className="flex-1 text-foreground text-base bg-background-elevated rounded-xl px-3 py-2 border border-border"
          />
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Pressable onPress={handleCreate} className="p-2">
                <Icons.Check size={20} color={colors.primary} />
              </Pressable>
              <Pressable onPress={() => { setAdding(false); setNewName(''); }} className="p-2">
                <Icons.Close size={20} color={colors.textSecondary} />
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <Pressable
          onPress={() => setAdding(true)}
          className="flex-row items-center px-4 py-3.5 gap-2 active:bg-background-elevated/50"
        >
          <Icons.Plus size={16} color={colors.primary} />
          <Text className="text-primary-400 text-sm font-medium">
            {parentId ? 'Neue Unterkategorie' : 'Neue Kategorie'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
