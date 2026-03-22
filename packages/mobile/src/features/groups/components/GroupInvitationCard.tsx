import { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { groupService } from '../services/groupService';
import type { GroupInvitation } from '../types/group.types';

interface GroupInvitationCardProps {
  invitation: GroupInvitation;
  onResponded: () => void;
}

/** Einladungs-Karte: Gruppe + Einladender + Annehmen/Ablehnen */
export function GroupInvitationCard({ invitation, onResponded }: GroupInvitationCardProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);

  const inviterName =
    invitation.invitedBy.displayName ?? invitation.invitedBy.username ?? 'Jemand';

  async function respond(action: 'accept' | 'decline') {
    setLoading(action);
    try {
      if (action === 'accept') await groupService.acceptInvitation(invitation.id);
      else await groupService.declineInvitation(invitation.id);
      onResponded();
    } finally {
      setLoading(null);
    }
  }

  return (
    <View className="bg-background-card border border-border rounded-2xl p-4 mx-4 mb-3">
      {/* Gruppen-Info */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center overflow-hidden mr-3">
          {invitation.group.avatarUrl ? (
            <Image source={{ uri: invitation.group.avatarUrl }} className="w-10 h-10" resizeMode="cover" />
          ) : (
            <Icons.Grid size={18} color={colors.primary} />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold" numberOfLines={1}>{invitation.group.name}</Text>
          <Text className="text-foreground-secondary text-xs">
            {invitation.group._count.members} Mitglieder
          </Text>
        </View>
      </View>

      <Text className="text-foreground-secondary text-sm mb-3">
        <Text className="text-foreground font-medium">{inviterName}</Text> hat dich eingeladen
      </Text>

      {/* Buttons */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => respond('decline')}
          disabled={loading !== null}
          className="flex-1 rounded-xl py-2.5 items-center border border-border active:opacity-70"
        >
          {loading === 'decline' ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Text className="text-foreground-secondary font-medium text-sm">Ablehnen</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => respond('accept')}
          disabled={loading !== null}
          className="flex-1 rounded-xl py-2.5 items-center bg-primary active:opacity-80"
        >
          {loading === 'accept' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-sm">Beitreten</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
