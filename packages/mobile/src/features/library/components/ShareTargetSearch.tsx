import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { SearchBar } from '@/features/social/components/SearchBar';
import { useFollowing } from '@/features/social/hooks/useFollowList';
import { useGroupList } from '@/features/groups/hooks/useGroupList';
import { searchUsers } from '@/features/social/services/profileService';
import type { ShareTarget } from '../types/sharing.types';
import type { PublicProfile } from '@/features/social/types/profile.types';

interface ShareTargetSearchProps {
  ownUserId: string;
  onSelect: (target: ShareTarget) => void;
}

const DEBOUNCE_MS = 300;

/**
 * Durchsucht Followees + eigene Gruppen.
 * Ohne Suche: zeigt Following-Liste + Gruppen als Schnellauswahl.
 */
export function ShareTargetSearch({ ownUserId, onSelect }: ShareTargetSearchProps) {
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { users: following } = useFollowing(ownUserId);
  const { groups } = useGroupList();

  const isSearching = query.trim().length >= 2;

  useEffect(() => {
    if (!isSearching) { setSearchResults([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(query.trim());
        // Nur Followees anzeigen (gegenseitig)
        const followingIds = new Set(following.map((f) => f.id));
        setSearchResults(results.filter((u) => followingIds.has(u.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, following, isSearching]);

  function selectUser(profile: PublicProfile) {
    onSelect({
      type: 'user',
      id: profile.id,
      name: profile.displayName ?? profile.username ?? 'Benutzer',
      avatarUrl: profile.avatarUrl,
      subtitle: profile.username ? `@${profile.username}` : undefined,
    });
  }

  function selectGroup(group: { id: string; name: string; avatarUrl: string | null; memberCount: number }) {
    onSelect({
      type: 'group',
      id: group.id,
      name: group.name,
      avatarUrl: group.avatarUrl,
      subtitle: `${group.memberCount} Mitglieder`,
    });
  }

  const userList = isSearching ? searchResults : following;

  return (
    <View className="flex-1">
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        loading={searching}
        placeholder="Freunde oder Gruppen suchen…"
      />

      <FlatList
        data={[]}
        renderItem={null}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Personen */}
            {userList.length > 0 && (
              <>
                <Text className="text-foreground-secondary text-xs font-semibold px-4 pt-4 pb-2 uppercase tracking-wide">
                  {isSearching ? 'Personen' : 'Freunde'}
                </Text>
                {userList.map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => selectUser(u)}
                    className="flex-row items-center px-4 py-3 active:bg-background-card/50"
                  >
                    <View className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 items-center justify-center overflow-hidden mr-3">
                      {u.avatarUrl
                        ? <Image source={{ uri: u.avatarUrl }} className="w-10 h-10" resizeMode="cover" />
                        : <Icons.User size={18} color={colors.primary} />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
                        {u.displayName ?? u.username ?? 'Benutzer'}
                      </Text>
                      {u.username && <Text className="text-foreground-secondary text-xs">@{u.username}</Text>}
                    </View>
                    <Icons.ChevronRight size={16} color={colors.textSecondary} />
                  </Pressable>
                ))}
              </>
            )}

            {/* Gruppen (nur wenn nicht gesucht wird) */}
            {!isSearching && groups.length > 0 && (
              <>
                <Text className="text-foreground-secondary text-xs font-semibold px-4 pt-4 pb-2 uppercase tracking-wide">
                  Gruppen
                </Text>
                {groups.map((g) => (
                  <Pressable
                    key={g.id}
                    onPress={() => selectGroup(g)}
                    className="flex-row items-center px-4 py-3 active:bg-background-card/50"
                  >
                    <View className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 items-center justify-center overflow-hidden mr-3">
                      {g.avatarUrl
                        ? <Image source={{ uri: g.avatarUrl }} className="w-10 h-10" resizeMode="cover" />
                        : <Icons.Grid size={18} color={colors.primary} />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium text-sm" numberOfLines={1}>{g.name}</Text>
                      <Text className="text-foreground-secondary text-xs">{g.memberCount} Mitglieder</Text>
                    </View>
                    <Icons.ChevronRight size={16} color={colors.textSecondary} />
                  </Pressable>
                ))}
              </>
            )}

            {/* Leer-State */}
            {userList.length === 0 && groups.length === 0 && (
              <View className="items-center pt-12 px-8">
                <Icons.Share size={40} color={colors.textSecondary} />
                <Text className="text-foreground text-base font-semibold mt-3 text-center">
                  Noch keine Verbindungen
                </Text>
                <Text className="text-foreground-secondary text-sm mt-1 text-center leading-5">
                  Folge anderen Usern oder tritt Gruppen bei, um Items zu teilen.
                </Text>
              </View>
            )}
          </>
        }
      />
    </View>
  );
}
