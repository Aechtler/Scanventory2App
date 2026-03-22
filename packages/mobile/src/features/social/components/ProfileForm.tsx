import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useProfile } from '../hooks/useProfile';
import { AvatarPicker } from './AvatarPicker';
import { UsernameInput } from './UsernameInput';
import type { PublicProfile } from '../types/profile.types';

interface ProfileFormProps {
  currentProfile: PublicProfile;
  currentUsername?: string | null;
  onSaved: (profile: PublicProfile) => void;
  onCancel: () => void;
}

/**
 * Formular zum Bearbeiten des eigenen Profils.
 * Avatar, Username, Display-Name, Bio, Sichtbarkeit.
 */
export function ProfileForm({
  currentProfile,
  currentUsername,
  onSaved,
  onCancel,
}: ProfileFormProps) {
  const colors = useThemeColors();
  const { updating, error, update, clearError } = useProfile();

  const [username, setUsername] = useState(currentProfile.username ?? '');
  const [displayName, setDisplayName] = useState(currentProfile.displayName ?? '');
  const [bio, setBio] = useState(currentProfile.bio ?? '');
  const [isPublic, setIsPublic] = useState(currentProfile.isPublic);
  const [avatarUri, setAvatarUri] = useState<string | null>(currentProfile.avatarUrl ?? null);

  async function handleSave() {
    clearError();
    try {
      const saved = await update({
        username: username || undefined,
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        isPublic,
        // avatarUrl wird separat über einen Upload-Endpoint gesetzt (Phase 1b)
        // Für jetzt: lokaler URI wird als Platzhalter gespeichert
        ...(avatarUri !== currentProfile.avatarUrl && { avatarUrl: avatarUri ?? undefined }),
      });
      onSaved(saved);
    } catch {
      // Fehler wird über error State angezeigt
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pt-6 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar */}
      <View className="items-center mb-8">
        <AvatarPicker
          currentAvatarUrl={avatarUri}
          onUploaded={setAvatarUri}
          size={96}
        />
        <Text className="text-foreground-secondary text-xs mt-2">Tippe um Foto zu ändern</Text>
      </View>

      {/* Username */}
      <UsernameInput
        value={username}
        onChangeText={setUsername}
        currentUsername={currentUsername}
      />

      {/* Display-Name */}
      <View className="mb-4">
        <Text className="text-foreground-secondary text-xs mb-1 font-medium">ANZEIGENAME</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Dein Name"
          placeholderTextColor={colors.textSecondary}
          className="bg-background-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
          maxLength={60}
        />
      </View>

      {/* Bio */}
      <View className="mb-4">
        <Text className="text-foreground-secondary text-xs mb-1 font-medium">BIO</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Erzähl etwas über dich…"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
          className="bg-background-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
          maxLength={150}
        />
        <Text className="text-foreground-secondary/50 text-xs text-right mt-1">
          {bio.length}/150
        </Text>
      </View>

      {/* Sichtbarkeit */}
      <View className="bg-background-card border border-border rounded-xl px-4 py-3 flex-row items-center justify-between mb-6">
        <View className="flex-1 mr-4">
          <Text className="text-foreground font-medium">Öffentliches Profil</Text>
          <Text className="text-foreground-secondary text-xs mt-0.5">
            Andere können dein Profil und geteilte Items sehen
          </Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>

      {/* Fehler */}
      {error ? (
        <View className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      ) : null}

      {/* Buttons */}
      <Pressable
        onPress={handleSave}
        disabled={updating}
        className="bg-primary rounded-xl py-4 items-center mb-3 active:opacity-80"
      >
        {updating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Speichern</Text>
        )}
      </Pressable>

      <Pressable
        onPress={onCancel}
        disabled={updating}
        className="rounded-xl py-4 items-center active:opacity-70"
      >
        <Text className="text-foreground-secondary font-medium">Abbrechen</Text>
      </Pressable>
    </ScrollView>
  );
}
