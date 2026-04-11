/**
 * Meine Verkäufe — Übersicht aller angelegten Inserate
 * Tabs: Aktiv | Entwürfe | Verkauft
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Stack } from 'expo-router';
import { useListingStore } from '@/features/listings/store/listingStore';
import { useEbayConnectionStore } from '@/features/listings/store/ebayConnectionStore';
import { PLATFORM_META } from '@/features/listings/services/sellUrlService';
import type { Listing, ListingStatus } from '@/features/listings/types/listing.types';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { FadeInView } from '@/shared/components/Animated';
import { API_CONFIG } from '@/shared/constants';

type Tab = 'active' | 'draft' | 'sold';

const TABS: { id: Tab; label: string; statuses: ListingStatus[] }[] = [
  { id: 'active', label: 'Aktiv', statuses: ['active'] },
  { id: 'draft', label: 'Entwürfe', statuses: ['draft'] },
  { id: 'sold', label: 'Verkauft', statuses: ['sold', 'cancelled'] },
];

function formatPrice(value: number | null | undefined): string {
  if (value == null) return '–';
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function ListingCard({ listing, onSold, onDelete }: {
  listing: Listing;
  onSold: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const colors = useThemeColors();
  const meta = PLATFORM_META[listing.platform];
  const imageUri = listing.imageFilename
    ? `${API_CONFIG.BASE_URL}/api/images/${listing.imageFilename}`
    : null;

  const priceLabel =
    listing.status === 'sold'
      ? `Verkauft für ${formatPrice(listing.soldPrice)}`
      : listing.listingType === 'auction'
        ? `Auktion ab ${formatPrice(listing.startingPrice ?? 0)}`
        : listing.listingType === 'negotiable'
          ? `VB ${listing.fixedPrice != null ? formatPrice(listing.fixedPrice) : ''}`
          : `Festpreis ${formatPrice(listing.fixedPrice)}`;

  return (
    <View className="bg-background-card rounded-2xl border border-border mb-3 overflow-hidden">
      <View className="flex-row p-4 gap-3">
        {/* Thumbnail */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-16 h-16 rounded-xl bg-background-elevated"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-xl bg-background-elevated items-center justify-center">
            <Icons.Package size={24} color={colors.textSecondary} />
          </View>
        )}

        {/* Info */}
        <View className="flex-1">
          <Text className="text-foreground font-semibold text-sm" numberOfLines={2}>
            {listing.productName ?? 'Unbekanntes Produkt'}
          </Text>

          {/* Platform Badge + Preis */}
          <View className="flex-row items-center gap-2 mt-1.5">
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: meta.color + '25' }}
            >
              <Text className="text-xs font-semibold" style={{ color: meta.color }}>
                {meta.label}
              </Text>
            </View>
            <Text className="text-foreground-secondary text-xs">{priceLabel}</Text>
          </View>

          {listing.createdAt && (
            <Text className="text-foreground-secondary text-xs mt-1">
              {new Date(listing.createdAt).toLocaleDateString('de-DE')}
            </Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row border-t border-border">
        {listing.externalUrl && (
          <Pressable
            onPress={() => Linking.openURL(listing.externalUrl!)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-3 active:opacity-60"
          >
            <Icons.ExternalLink size={14} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-xs font-medium">Öffnen</Text>
          </Pressable>
        )}

        {listing.status !== 'sold' && listing.status !== 'cancelled' && (
          <>
            {listing.externalUrl && <View className="w-px bg-border" />}
            <Pressable
              onPress={() => onSold(listing.id)}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3 active:opacity-60"
            >
              <Icons.Check size={14} color="#22c55e" />
              <Text className="text-xs font-medium" style={{ color: '#22c55e' }}>
                Als verkauft
              </Text>
            </Pressable>
            <View className="w-px bg-border" />
          </>
        )}

        <Pressable
          onPress={() => onDelete(listing.id)}
          className="px-4 flex-row items-center justify-center gap-1.5 py-3 active:opacity-60"
        >
          <Icons.Trash2 size={14} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}

function SoldDialog({ visible, onClose, onConfirm }: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (price: number) => void;
}) {
  const colors = useThemeColors();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (visible) setInput('');
  }, [visible]);

  function handleConfirm() {
    const price = parseFloat(input.replace(',', '.'));
    if (!isNaN(price) && price >= 0) {
      onConfirm(price);
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/60 justify-end">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable onPress={() => {}}>
            <View className="bg-background rounded-t-3xl px-6 pt-5 pb-10 border-t border-border/50">
              <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />
              <Text className="text-foreground text-lg font-semibold mb-1">Verkauft!</Text>
              <Text className="text-foreground-secondary text-sm mb-5">
                Für wie viel wurde das Item verkauft?
              </Text>
              <View className="flex-row items-center bg-background-elevated rounded-xl px-4 mb-5 border border-border">
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="0,00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                  autoFocus
                  className="flex-1 text-white text-2xl font-bold py-4"
                />
                <Text className="text-foreground-secondary text-xl font-medium">€</Text>
              </View>
              <Pressable
                onPress={handleConfirm}
                className="bg-emerald-600 py-4 rounded-2xl items-center active:bg-emerald-700"
              >
                <Text className="text-white font-semibold text-base">Bestätigen</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default function ListingsScreen() {
  const colors = useThemeColors();
  const { listings, fetchListings, syncEbayOrders, deleteListing, markAsSold, isSyncingOrders } =
    useListingStore();
  const { connected: ebayConnected } = useEbayConnectionStore();

  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [soldDialogId, setSoldDialogId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
    // eBay-Bestellungen im Hintergrund synchronisieren
    if (ebayConnected) {
      syncEbayOrders().catch(() => {});
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchListings();
    if (ebayConnected) {
      await syncEbayOrders();
    }
    setIsRefreshing(false);
  }, [ebayConnected]);

  const filteredListings = listings.filter((l) => {
    const tab = TABS.find((t) => t.id === activeTab);
    return tab?.statuses.includes(l.status as ListingStatus) ?? false;
  });

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Löschen?', 'Inserat wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: () => deleteListing(id) },
    ]);
  }, [deleteListing]);

  const handleSold = useCallback((id: string) => {
    setSoldDialogId(id);
  }, []);

  const handleSoldConfirm = useCallback(async (price: number) => {
    if (soldDialogId) {
      await markAsSold(soldDialogId, price);
      setSoldDialogId(null);
    }
  }, [soldDialogId, markAsSold]);

  const activeCount = listings.filter((l) => l.status === 'active').length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3 gap-3">
        <Pressable onPress={() => router.back()} className="p-2 rounded-xl bg-background-card border border-border active:opacity-70">
          <Icons.ChevronLeft size={20} color={colors.textSecondary} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-foreground text-xl font-bold">Meine Verkäufe</Text>
          {isSyncingOrders ? (
            <View className="flex-row items-center gap-1.5">
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text className="text-foreground-secondary text-xs">eBay wird geprüft…</Text>
            </View>
          ) : activeCount > 0 ? (
            <Text className="text-foreground-secondary text-xs">{activeCount} aktive Inserate</Text>
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-5 gap-2 mb-4">
        {TABS.map((tab) => {
          const count = listings.filter((l) =>
            tab.statuses.includes(l.status as ListingStatus)
          ).length;
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl items-center border"
              style={{
                backgroundColor: active ? colors.primary + '20' : 'transparent',
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: active ? '#60a5fa' : colors.textSecondary }}
              >
                {tab.label}
                {count > 0 ? ` (${count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Liste */}
      {filteredListings.length === 0 ? (
        <FadeInView delay={0} className="flex-1 items-center justify-center px-8">
          <Icons.Tag size={48} color={colors.textSecondary} />
          <Text className="text-foreground text-base font-semibold mt-4 text-center">
            {activeTab === 'active'
              ? 'Noch keine aktiven Inserate'
              : activeTab === 'draft'
                ? 'Noch keine Entwürfe'
                : 'Noch nichts verkauft'}
          </Text>
          <Text className="text-foreground-secondary text-sm mt-2 text-center">
            {activeTab === 'active'
              ? 'Öffne ein Item und tippe auf „Jetzt verkaufen".'
              : ''}
          </Text>
        </FadeInView>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => (
            <ListingCard listing={item} onSold={handleSold} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.textSecondary}
            />
          }
        />
      )}

      <SoldDialog
        visible={soldDialogId !== null}
        onClose={() => setSoldDialogId(null)}
        onConfirm={handleSoldConfirm}
      />
    </SafeAreaView>
  );
}
