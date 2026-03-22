import { useState } from 'react';
import {
  View, Text, FlatList, KeyboardAvoidingView,
  Platform, Pressable, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useSearch } from '../../features/social/hooks/useSearch';
import { useFollowing } from '../../features/social/hooks/useFollowList';
import { SearchBar } from '../../features/social/components/SearchBar';
import { UserCard } from '../../features/social/components/UserCard';
import { EmptySearchState } from '../../features/social/components/EmptySearchState';
import { useGroupList } from '../../features/groups/hooks/useGroupList';
import { GroupCard } from '../../features/groups/components/GroupCard';
import { GroupInvitationCard } from '../../features/groups/components/GroupInvitationCard';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { FadeInView } from '../../shared/components/Animated';
import { Icons } from '../../shared/components/Icons';
import { useThemeColors } from '../../shared/hooks/useThemeColors';

type Tab = 'people' | 'groups';

export default function SocialTab() {
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  const [activeTab, setActiveTab] = useState<Tab>('people');
  const { query, setQuery, results: userResults, state: searchState, clear } = useSearch();
  const { users: following, loading: followingLoading } = useFollowing(user?.id ?? '');
  const { groups, invitations, loading: groupsLoading, refetch: refetchGroups } = useGroupList();

  const isSearching = query.trim().length >= 2;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <FadeInView delay={0}>
          <View className="px-4 pt-4 pb-3">
            <Text className="text-foreground text-2xl font-bold mb-3">Entdecken</Text>
            <SearchBar
              value={query}
              onChangeText={(t) => { setQuery(t); }}
              onClear={clear}
              loading={searchState === 'loading'}
              placeholder="Suche nach @username oder Gruppe…"
            />
          </View>
        </FadeInView>

        {/* Segmented Control — nur wenn nicht aktiv gesucht wird */}
        {!isSearching && (
          <FadeInView delay={40}>
            <View className="flex-row mx-4 mb-1 bg-background-card border border-border rounded-xl p-1">
              {(['people', 'groups'] as Tab[]).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg items-center active:opacity-80 ${
                    activeTab === tab ? 'bg-primary' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      activeTab === tab ? 'text-white' : 'text-foreground-secondary'
                    }`}
                  >
                    {tab === 'people' ? 'Personen' : 'Gruppen'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </FadeInView>
        )}

        {/* ─── SUCHE aktiv ──────────────────────────────── */}
        {isSearching ? (
          <>
            {/* User-Ergebnisse */}
            {(searchState === 'results' || searchState === 'loading') && userResults.length > 0 ? (
              <FlatList
                data={userResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UserCard profile={item} ownUserId={user?.id} showFollowButton />
                )}
                contentContainerStyle={{ paddingBottom: tabBarPadding + 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <Text className="text-foreground-secondary text-xs font-semibold px-4 pt-2 pb-1 uppercase tracking-wide">
                    Personen
                  </Text>
                }
              />
            ) : searchState !== 'loading' ? (
              <EmptySearchState
                type={searchState === 'results' ? 'idle' : searchState}
                query={query}
              />
            ) : null}
          </>
        ) : activeTab === 'people' ? (
          /* ─── PERSONEN Tab ────────────────────────────── */
          <>
            {!followingLoading && following.length === 0 ? (
              <EmptySearchState type="idle" />
            ) : (
              <FlatList
                data={following}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UserCard profile={item} ownUserId={user?.id} showFollowButton />
                )}
                contentContainerStyle={{ paddingBottom: tabBarPadding + 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  following.length > 0 ? (
                    <Text className="text-foreground-secondary text-xs font-semibold px-4 pt-2 pb-1 uppercase tracking-wide">
                      Du folgst
                    </Text>
                  ) : null
                }
              />
            )}
          </>
        ) : (
          /* ─── GRUPPEN Tab ─────────────────────────────── */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: tabBarPadding + 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Offene Einladungen */}
            {invitations.length > 0 && (
              <>
                <Text className="text-foreground-secondary text-xs font-semibold px-4 pt-3 pb-2 uppercase tracking-wide">
                  Einladungen ({invitations.length})
                </Text>
                {invitations.map((inv) => (
                  <GroupInvitationCard
                    key={inv.id}
                    invitation={inv}
                    onResponded={refetchGroups}
                  />
                ))}
              </>
            )}

            {/* Eigene Gruppen */}
            <View className="flex-row items-center px-4 pt-3 pb-1 justify-between">
              <Text className="text-foreground-secondary text-xs font-semibold uppercase tracking-wide">
                Meine Gruppen
              </Text>
              <Pressable
                onPress={() => router.push('/groups/create')}
                className="flex-row items-center gap-1 active:opacity-60"
              >
                <Icons.Plus size={14} color={colors.primary} />
                <Text className="text-primary text-xs font-semibold">Neue Gruppe</Text>
              </Pressable>
            </View>

            {!groupsLoading && groups.length === 0 ? (
              <View className="items-center pt-10 px-8">
                <Icons.Grid size={40} color={colors.textSecondary} />
                <Text className="text-foreground text-base font-semibold mt-3 text-center">
                  Noch keine Gruppen
                </Text>
                <Text className="text-foreground-secondary text-sm mt-1 text-center leading-5">
                  Erstelle eine Gruppe oder tritt per Invite-Link bei.
                </Text>
                <View className="flex-row gap-3 mt-5">
                  <Pressable
                    onPress={() => router.push('/groups/create')}
                    className="bg-primary rounded-xl px-5 py-2.5 active:opacity-80"
                  >
                    <Text className="text-white font-semibold text-sm">Erstellen</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              groups.map((g) => (
                <GroupCard key={g.id} group={g} showRole />
              ))
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
