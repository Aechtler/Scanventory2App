import { ScrollView, Text, Pressable, View } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { CategoryNode } from '../types/category.types';

interface CategoryBreadcrumbProps {
  path: CategoryNode[];
  onNavigate: (index: number) => void; // -1 = Wurzel
}

export function CategoryBreadcrumb({ path, onNavigate }: CategoryBreadcrumbProps) {
  const colors = useThemeColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8, alignItems: 'center' }}
    >
      {/* Wurzel */}
      <Pressable onPress={() => onNavigate(-1)} className="px-2 py-1">
        <Text
          className={`text-sm font-medium ${
            path.length === 0 ? 'text-primary-400' : 'text-foreground-secondary'
          }`}
        >
          Kategorien
        </Text>
      </Pressable>

      {path.map((node, index) => (
        <View key={node.id} className="flex-row items-center">
          <Icons.ChevronRight size={14} color={colors.textSecondary} />
          <Pressable onPress={() => onNavigate(index)} className="px-2 py-1">
            <Text
              className={`text-sm font-medium ${
                index === path.length - 1 ? 'text-primary-400' : 'text-foreground-secondary'
              }`}
              numberOfLines={1}
            >
              {node.name}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
