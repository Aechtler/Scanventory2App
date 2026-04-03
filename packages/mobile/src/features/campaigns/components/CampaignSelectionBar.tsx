import { View, Text, Pressable } from 'react-native';

interface CampaignSelectionBarProps {
  selectedCount: number;
  onCancel: () => void;
  onSave: () => void;
}

export function CampaignSelectionBar({
  selectedCount,
  onCancel,
  onSave,
}: CampaignSelectionBarProps) {
  const canSave = selectedCount > 0;

  return (
    <View className="px-5 pt-5 pb-1 flex-row items-center justify-between">
      <Pressable onPress={onCancel} hitSlop={8} className="active:opacity-60">
        <Text className="text-foreground-secondary text-[16px] font-medium">Abbrechen</Text>
      </Pressable>

      <Text className="text-foreground text-[16px] font-semibold">
        {selectedCount === 0
          ? 'Items auswählen'
          : `${selectedCount} ${selectedCount === 1 ? 'Item' : 'Items'} ausgewählt`}
      </Text>

      <Pressable onPress={canSave ? onSave : undefined} hitSlop={8} className="active:opacity-60">
        <Text className={`text-[16px] font-semibold ${canSave ? 'text-primary-400' : 'text-foreground-secondary'}`}>
          Speichern
        </Text>
      </Pressable>
    </View>
  );
}
