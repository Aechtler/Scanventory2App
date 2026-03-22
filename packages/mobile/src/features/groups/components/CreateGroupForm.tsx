import { useState } from 'react';
import {
  View, Text, TextInput, Switch, Pressable,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useCreateGroup } from '../hooks/useCreateGroup';
import type { GroupSummary } from '../types/group.types';

interface CreateGroupFormProps {
  onCreated: (group: GroupSummary) => void;
  onCancel: () => void;
}

export function CreateGroupForm({ onCreated, onCancel }: CreateGroupFormProps) {
  const colors = useThemeColors();
  const { creating, error, create, clearError } = useCreateGroup();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  async function handleCreate() {
    clearError();
    try {
      const group = await create({
        name,
        description: description.trim() || undefined,
        isPublic,
      });
      onCreated(group);
    } catch {
      // Fehler via error State
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pt-6 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <View className="mb-4">
        <Text className="text-foreground-secondary text-xs mb-1 font-medium">GRUPPENNAME *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="z.B. Vintage Sammlung"
          placeholderTextColor={colors.textSecondary}
          className="bg-background-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
          maxLength={60}
          autoFocus
        />
      </View>

      {/* Beschreibung */}
      <View className="mb-4">
        <Text className="text-foreground-secondary text-xs mb-1 font-medium">BESCHREIBUNG</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Worum geht es in dieser Gruppe?"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
          className="bg-background-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
          maxLength={200}
        />
      </View>

      {/* Sichtbarkeit */}
      <View className="bg-background-card border border-border rounded-xl px-4 py-3 flex-row items-center justify-between mb-2">
        <View className="flex-1 mr-4">
          <Text className="text-foreground font-medium">Öffentliche Gruppe</Text>
          <Text className="text-foreground-secondary text-xs mt-0.5">
            Jeder kann die Gruppe finden und per Einladung beitreten
          </Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
      <Text className="text-foreground-secondary/60 text-xs mb-6 px-1">
        Private Gruppen sind nur per direktem Invite-Link oder Einladung auffindbar.
      </Text>

      {/* Fehler */}
      {error ? (
        <View className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      ) : null}

      {/* Buttons */}
      <Pressable
        onPress={handleCreate}
        disabled={creating || !name.trim()}
        className="bg-primary rounded-xl py-4 items-center mb-3 active:opacity-80 disabled:opacity-50"
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Gruppe erstellen</Text>
        )}
      </Pressable>

      <Pressable
        onPress={onCancel}
        disabled={creating}
        className="rounded-xl py-4 items-center active:opacity-70"
      >
        <Text className="text-foreground-secondary font-medium">Abbrechen</Text>
      </Pressable>
    </ScrollView>
  );
}
