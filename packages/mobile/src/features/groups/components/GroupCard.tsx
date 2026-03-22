import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { GroupSummary } from '../types/group.types';

interface GroupCardProps {
  group: GroupSummary;
  showRole?: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Ersteller',
  ADMIN: 'Admin',
  MEMBER: 'Mitglied',
};

export function GroupCard({ group, showRole = false }: GroupCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => router.push(`/groups/${group.id}`)}
      className="flex-row items-center py-3 px-4 active:bg-background-card/50"
    >
      {/* Gruppen-Avatar */}
      <View className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/20 items-center justify-center overflow-hidden mr-3">
        {group.avatarUrl ? (
          <Image source={{ uri: group.avatarUrl }} className="w-11 h-11" resizeMode="cover" />
        ) : (
          <Icons.Grid size={20} color={colors.primary} />
        )}
      </View>

      {/* Name + Beschreibung */}
      <View className="flex-1 mr-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-foreground font-semibold text-sm flex-shrink" numberOfLines={1}>
            {group.name}
          </Text>
          {group.isPublic && (
            <View className="bg-primary/10 rounded px-1.5 py-0.5">
              <Text className="text-primary text-xs">Öffentlich</Text>
            </View>
          )}
        </View>
        <Text className="text-foreground-secondary text-xs mt-0.5">
          {group.memberCount} {group.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
          {showRole && group.myRole ? ` · ${ROLE_LABEL[group.myRole]}` : ''}
        </Text>
        {group.description ? (
          <Text className="text-foreground-secondary/70 text-xs mt-0.5" numberOfLines={1}>
            {group.description}
          </Text>
        ) : null}
      </View>

      <Icons.ChevronRight size={16} color={colors.textSecondary} />
    </Pressable>
  );
}
