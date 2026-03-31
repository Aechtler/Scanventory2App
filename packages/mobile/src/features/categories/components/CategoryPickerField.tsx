import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { Icons } from '@/shared/components/Icons';
import { CategoryPickerModal } from './CategoryPickerModal';
import type { CategoryNode } from '../types';

interface CategoryPickerFieldProps {
  value: string | null;       // Anzeige-Pfad: "Videospiele > Sony > PS5 > Games"
  categoryId: string | null;
  onSelect: (node: CategoryNode, pathString: string) => void;
  label?: string;
  placeholder?: string;
}

/**
 * Einbettbares Formular-Feld, das den CategoryPickerModal öffnet.
 * Nutzung: In Edit-Screens, Scan-Ergebnis etc.
 */
export function CategoryPickerField({
  value,
  categoryId,
  onSelect,
  label = 'Kategorie',
  placeholder = 'Kategorie auswählen...',
}: CategoryPickerFieldProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  return (
    <>
      {label ? (
        <Text className="text-foreground-secondary text-xs font-medium mb-1.5 uppercase tracking-wide">
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-background-elevated border border-border rounded-xl px-4 py-3 active:opacity-80"
      >
        <Icons.Tag size={16} color={value ? colors.primary : colors.textSecondary} />
        <View className="flex-1 ml-3">
          {value ? (
            <Text className="text-foreground text-sm" numberOfLines={1}>
              {value}
            </Text>
          ) : (
            <Text className="text-foreground-secondary text-sm">{placeholder}</Text>
          )}
        </View>
        <Icons.ChevronRight size={16} color={colors.textSecondary} />
      </Pressable>

      <CategoryPickerModal
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={(node, path) => { onSelect(node, path); setOpen(false); }}
        selectedId={categoryId}
      />
    </>
  );
}
