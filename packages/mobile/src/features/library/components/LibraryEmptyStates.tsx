import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';

interface LibraryEmptyStateProps {
  iconColor: string;
}

interface LibraryFilteredEmptyStateProps {
  iconColor: string;
  onResetFilters: () => void;
}

export function LibraryEmptyState({ iconColor }: LibraryEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="mb-8 bg-background-elevated/50 p-8 rounded-full"
      >
        <Icons.Inbox size={56} color={iconColor} />
      </MotiView>
      <Text className="text-foreground text-2xl font-bold mb-3 text-center">
        Noch keine Scans
      </Text>
      <Text className="text-foreground-secondary text-base text-center leading-6 max-w-[280px]">
        Scanne deinen ersten Gegenstand und entdecke seinen Marktwert
      </Text>
    </View>
  );
}

export function LibraryFilteredEmptyState({
  iconColor,
  onResetFilters,
}: LibraryFilteredEmptyStateProps) {
  return (
    <View className="items-center py-16">
      <Icons.Search size={44} color={iconColor} />
      <Text className="text-foreground-secondary text-base mt-4">
        Keine Treffer
      </Text>
      <Pressable
        onPress={onResetFilters}
        className="mt-3 px-5 py-2.5 rounded-xl bg-primary-500/10"
      >
        <Text className="text-primary text-[15px] font-medium">
          Filter zurücksetzen
        </Text>
      </Pressable>
    </View>
  );
}
