import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { GroupMember, GroupRole } from '../types/group.types';

interface MemberListItemProps {
  member: GroupMember;
  canRemove?: boolean;
  onRemove?: (userId: string) => void;
}

const ROLE_COLOR: Record<GroupRole, string> = {
  OWNER: '#f59e0b',
  ADMIN: '#6366f1',
  MEMBER: '#6b7280',
};

const ROLE_LABEL: Record<GroupRole, string> = {
  OWNER: 'Ersteller',
  ADMIN: 'Admin',
  MEMBER: 'Mitglied',
};

export function MemberListItem({ member, canRemove, onRemove }: MemberListItemProps) {
  const colors = useThemeColors();
  const displayName = member.displayName || member.username || 'Benutzer';

  return (
    <Pressable
      onPress={() => router.push(`/profile/${member.userId}`)}
      className="flex-row items-center py-3 px-4 active:bg-background-card/40"
    >
      {/* Avatar */}
      <View className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 items-center justify-center overflow-hidden mr-3">
        {member.avatarUrl ? (
          <Image source={{ uri: member.avatarUrl }} className="w-10 h-10" resizeMode="cover" />
        ) : (
          <Icons.User size={18} color={colors.primary} />
        )}
      </View>

      {/* Name + Rolle */}
      <View className="flex-1">
        <Text className="text-foreground font-medium text-sm" numberOfLines={1}>{displayName}</Text>
        {member.username ? (
          <Text className="text-foreground-secondary text-xs">@{member.username}</Text>
        ) : null}
      </View>

      {/* Rollen-Badge */}
      <View
        className="rounded-full px-2.5 py-1 mr-2"
        style={{ backgroundColor: `${ROLE_COLOR[member.role]}20` }}
      >
        <Text className="text-xs font-medium" style={{ color: ROLE_COLOR[member.role] }}>
          {ROLE_LABEL[member.role]}
        </Text>
      </View>

      {/* Entfernen-Button (nur für Owner/Admin sichtbar, nicht für Owner-Zeile) */}
      {canRemove && member.role !== 'OWNER' && (
        <Pressable
          onPress={() => onRemove?.(member.userId)}
          className="p-1.5 active:opacity-60"
          hitSlop={8}
        >
          <Icons.Close size={14} color={colors.textSecondary} />
        </Pressable>
      )}
    </Pressable>
  );
}
