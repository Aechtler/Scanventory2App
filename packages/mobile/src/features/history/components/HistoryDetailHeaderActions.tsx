import { Pressable } from 'react-native';

import { Icons } from '@/shared/components/Icons';

interface HistoryDetailHeaderActionsProps {
  onDelete: () => void;
}

export function HistoryDetailHeaderActions({ onDelete }: HistoryDetailHeaderActionsProps) {
  return (
    <Pressable
      onPress={onDelete}
      className="p-2 rounded-full active:bg-red-500/20"
      hitSlop={8}
    >
      <Icons.Close size={20} color="#ef4444" />
    </Pressable>
  );
}
