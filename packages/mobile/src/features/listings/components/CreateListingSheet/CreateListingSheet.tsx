/**
 * CreateListingSheet — Bottom Sheet zum Anlegen eines Verkaufsinserats
 * eBay: direkt via API einstellen (kein Browser-Redirect)
 * Kleinanzeigen/Amazon: Deep Link + App-Tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useListingStore } from '../../store/listingStore';
import { useEbayConnectionStore } from '../../store/ebayConnectionStore';
import { generateSellUrl, PLATFORM_META } from '../../services/sellUrlService';
import { apiPost } from '@/shared/services/apiClient';
import type { PlatformRecommendation } from '../../types/listing.types';
import type { ListingPlatform, ListingType } from '../../types/listing.types';
import type { HistoryItem } from '@/features/history/store/types';

interface CreateListingSheetProps {
  visible: boolean;
  onClose: () => void;
  item: HistoryItem;
  initialPlatform?: ListingPlatform;
}

const PLATFORMS: ListingPlatform[] = ['ebay', 'kleinanzeigen', 'amazon'];

const LISTING_TYPES: { id: ListingType; label: string; platforms: ListingPlatform[] }[] = [
  { id: 'auction', label: 'Auktion', platforms: ['ebay'] },
  { id: 'fixed_price', label: 'Festpreis', platforms: ['ebay', 'kleinanzeigen', 'amazon'] },
  { id: 'negotiable', label: 'VB', platforms: ['kleinanzeigen'] },
];

type SheetState = 'ai_loading' | 'form' | 'loading' | 'success' | 'error';

export function CreateListingSheet({
  visible,
  onClose,
  item,
  initialPlatform = 'ebay',
}: CreateListingSheetProps) {
  const colors = useThemeColors();
  const { createListing, updateListing } = useListingStore();
  const { connected: ebayConnected, connect: connectEbay } = useEbayConnectionStore();

  const [platform, setPlatform] = useState<ListingPlatform>(initialPlatform);
  const [listingType, setListingType] = useState<ListingType>('fixed_price');
  const [priceInput, setPriceInput] = useState('');
  const [sheetState, setSheetState] = useState<SheetState>('ai_loading');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const priceInputRef = useRef<TextInput>(null);

  const availableTypes = LISTING_TYPES.filter((t) => t.platforms.includes(platform));

  useEffect(() => {
    const still = availableTypes.find((t) => t.id === listingType);
    if (!still) setListingType(availableTypes[0]?.id ?? 'fixed_price');
  }, [platform]);

  useEffect(() => {
    if (visible) {
      setPlatform(initialPlatform);
      setSheetState('ai_loading');
      setResultUrl(null);
      setErrorMsg(null);
      setAiReasoning(null);
      setPriceInput(item.finalPrice != null ? item.finalPrice.toString() : '');
      fetchAiRecommendation();
    }
  }, [visible, initialPlatform]);

  async function fetchAiRecommendation() {
    try {
      const res = await apiPost<PlatformRecommendation>('/api/ai/recommend-platform', {
        productName: item.productName,
        category: item.category ?? 'Sonstiges',
        condition: item.condition,
        brand: item.brand,
        finalPrice: item.finalPrice,
        priceStats: item.priceStats,
      });

      if (res.success && res.data) {
        const rec = res.data;
        // Plattform aus Empfehlung übernehmen (nur eBay/amazon — kleinanzeigen als fallback)
        const mappedPlatform: ListingPlatform =
          rec.platform === 'ebay' ? 'ebay'
          : rec.platform === 'amazon' ? 'amazon'
          : 'ebay'; // vinted → eBay als nächste verfügbare Option
        setPlatform(mappedPlatform);
        setListingType(rec.listingType === 'auction' ? 'auction' : 'fixed_price');
        if (rec.suggestedPrice > 0 && !item.finalPrice) {
          setPriceInput(rec.suggestedPrice.toString());
        }
        setAiReasoning(rec.reasoning);
      }
    } catch {
      // Fehler ignorieren — einfach zum Formular gehen
    } finally {
      setSheetState('form');
      setTimeout(() => priceInputRef.current?.focus(), 350);
    }
  }

  const price = parseFloat(priceInput.replace(',', '.')) || undefined;
  const imageSource = item.cachedImageUri ? { uri: item.cachedImageUri } : { uri: item.imageUri };
  const meta = PLATFORM_META[platform];

  async function handleInsert(asDraft = false) {
    setSheetState('loading');

    // 1. Listing lokal + im Backend anlegen
    const listing = await createListing({
      itemId: item.serverId ?? item.id,
      platform,
      listingType,
      fixedPrice: listingType === 'fixed_price' || listingType === 'negotiable' ? (price ?? null) : null,
      startingPrice: listingType === 'auction' ? (price ?? 0) : null,
      status: asDraft ? 'draft' : 'active',
      productName: item.productName,
    });

    if (asDraft) {
      onClose();
      return;
    }

    // 2a. eBay → direkt via API einstellen
    if (platform === 'ebay' && ebayConnected) {
      try {
        const res = await apiPost<{ listingId: string; listingUrl: string }>(
          '/api/ebay/listing',
          { listingId: listing.id },
        );
        if (res.success && res.data) {
          updateListing(listing.id, { externalUrl: res.data.listingUrl, status: 'active' });
          setResultUrl(res.data.listingUrl);
          setSheetState('success');
        } else {
          throw new Error((res as any).error?.message ?? 'Unbekannter Fehler');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'eBay API Fehler';
        setErrorMsg(msg);
        setSheetState('error');
      }
      return;
    }

    // 2b. Andere Plattformen (oder eBay nicht verbunden) → Browser öffnen
    const sellUrl = generateSellUrl(platform, item.searchQuery || item.productName, price);
    await Linking.openURL(sellUrl);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={sheetState === 'form' ? onClose : undefined} className="flex-1 bg-black/60 justify-end">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable onPress={() => {}}>
            <MotiView
              from={{ translateY: 300, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-background rounded-t-3xl border-t border-border/50"
            >
              {/* ─── AI Loading ──────────────────────────── */}
              {sheetState === 'ai_loading' && (
                <View className="px-6 pt-8 pb-16 items-center gap-4">
                  <View className="w-10 h-1 bg-border rounded-full self-center mb-3" />
                  <ActivityIndicator size="large" color="#60a5fa" />
                  <Text className="text-foreground text-base font-semibold">
                    KI analysiert deinen Artikel…
                  </Text>
                  <Text className="text-foreground-secondary text-sm text-center">
                    Beste Plattform und Preis werden ermittelt.
                  </Text>
                </View>
              )}

              {/* ─── Loading ─────────────────────────────── */}
              {sheetState === 'loading' && (
                <View className="px-6 pt-8 pb-16 items-center gap-4">
                  <View className="w-10 h-1 bg-border rounded-full self-center mb-3" />
                  <ActivityIndicator size="large" color={meta.color} />
                  <Text className="text-foreground text-base font-semibold">
                    Wird eingestellt…
                  </Text>
                  <Text className="text-foreground-secondary text-sm text-center">
                    Dein Inserat wird direkt auf {meta.label} erstellt.
                  </Text>
                </View>
              )}

              {/* ─── Success ─────────────────────────────── */}
              {sheetState === 'success' && (
                <View className="px-6 pt-6 pb-12 items-center gap-3">
                  <View className="w-10 h-1 bg-border rounded-full self-center mb-3" />
                  <View className="w-16 h-16 rounded-full bg-emerald-500/20 items-center justify-center mb-2">
                    <Icons.Check size={32} color="#22c55e" />
                  </View>
                  <Text className="text-foreground text-xl font-bold text-center">
                    Inserat eingestellt!
                  </Text>
                  <Text className="text-foreground-secondary text-sm text-center">
                    Dein Artikel ist jetzt auf {meta.label} aktiv.
                  </Text>
                  {resultUrl && (
                    <Pressable
                      onPress={() => Linking.openURL(resultUrl)}
                      className="flex-row items-center gap-2 mt-2 py-3 px-5 rounded-xl border border-border active:opacity-70"
                    >
                      <Icons.ExternalLink size={16} color={colors.textSecondary} />
                      <Text className="text-foreground-secondary text-sm font-medium">
                        Inserat öffnen
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={onClose}
                    className="w-full py-4 rounded-2xl items-center mt-2"
                    style={{ backgroundColor: meta.color }}
                  >
                    <Text className="text-white font-semibold text-base">Fertig</Text>
                  </Pressable>
                </View>
              )}

              {/* ─── Error ───────────────────────────────── */}
              {sheetState === 'error' && (
                <View className="px-6 pt-6 pb-12 items-center gap-3">
                  <View className="w-10 h-1 bg-border rounded-full self-center mb-3" />
                  <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-2">
                    <Icons.Warning size={32} color="#ef4444" />
                  </View>
                  <Text className="text-foreground text-lg font-bold text-center">
                    Fehler beim Einstellen
                  </Text>
                  <Text className="text-foreground-secondary text-sm text-center" numberOfLines={4}>
                    {errorMsg}
                  </Text>
                  <Pressable
                    onPress={() => setSheetState('form')}
                    className="w-full py-4 rounded-2xl items-center mt-2 border border-border active:opacity-70"
                  >
                    <Text className="text-foreground font-semibold text-base">Zurück</Text>
                  </Pressable>
                </View>
              )}

              {/* ─── Form ────────────────────────────────── */}
              {sheetState === 'form' && (
                <ScrollView
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
                >
                  <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />

                  {/* Item-Preview */}
                  <View className="flex-row items-center gap-3 mb-6">
                    <Image
                      source={imageSource}
                      className="w-14 h-14 rounded-xl bg-background-card"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-base" numberOfLines={2}>
                        {item.productName}
                      </Text>
                      <Text className="text-foreground-secondary text-xs mt-0.5">
                        {item.condition}{item.brand ? ` · ${item.brand}` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* KI-Empfehlung Banner */}
                  {aiReasoning && (
                    <View className="flex-row items-start gap-2 mb-5 px-3 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <Icons.Sparkles size={14} color="#60a5fa" style={{ marginTop: 2 }} />
                      <Text className="text-blue-400 text-xs flex-1 leading-relaxed">
                        {aiReasoning}
                      </Text>
                    </View>
                  )}

                  {/* Plattform */}
                  <Text className="text-foreground-secondary text-xs font-semibold uppercase tracking-wide mb-2">
                    Plattform
                  </Text>
                  <View className="flex-row gap-2 mb-5">
                    {PLATFORMS.map((p) => {
                      const m = PLATFORM_META[p];
                      const active = platform === p;
                      return (
                        <Pressable
                          key={p}
                          onPress={() => setPlatform(p)}
                          className="flex-1 py-3 rounded-xl items-center border"
                          style={{
                            backgroundColor: active ? m.color + '25' : 'transparent',
                            borderColor: active ? m.color : colors.border,
                          }}
                        >
                          <Text className="font-semibold text-sm" style={{ color: active ? m.color : colors.textSecondary }}>
                            {m.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Typ */}
                  <Text className="text-foreground-secondary text-xs font-semibold uppercase tracking-wide mb-2">
                    Typ
                  </Text>
                  <View className="flex-row gap-2 mb-5">
                    {availableTypes.map((t) => {
                      const active = listingType === t.id;
                      return (
                        <Pressable
                          key={t.id}
                          onPress={() => setListingType(t.id)}
                          className="flex-1 py-3 rounded-xl items-center border"
                          style={{
                            backgroundColor: active ? colors.primary + '25' : 'transparent',
                            borderColor: active ? colors.primary : colors.border,
                          }}
                        >
                          <Text className="font-semibold text-sm" style={{ color: active ? '#60a5fa' : colors.textSecondary }}>
                            {t.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Preis */}
                  <Text className="text-foreground-secondary text-xs font-semibold uppercase tracking-wide mb-2">
                    {listingType === 'auction' ? 'Startpreis' : listingType === 'negotiable' ? 'Preis (VB)' : 'Festpreis'}
                  </Text>
                  <View className="flex-row items-center bg-background-elevated rounded-xl px-4 mb-6 border border-border">
                    <TextInput
                      ref={priceInputRef}
                      value={priceInput}
                      onChangeText={setPriceInput}
                      placeholder={listingType === 'auction' ? '0' : '0,00'}
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      className="flex-1 text-white text-2xl font-bold py-4"
                    />
                    <Text className="text-foreground-secondary text-xl font-medium">€</Text>
                  </View>

                  {/* eBay: verbinden oder direkt einstellen */}
                  {platform === 'ebay' ? (
                    ebayConnected ? (
                      <Pressable
                        onPress={() => handleInsert(false)}
                        className="py-4 rounded-2xl items-center mb-3 active:opacity-80"
                        style={{ backgroundColor: meta.color }}
                      >
                        <View className="flex-row items-center gap-2">
                          <Icons.Check size={18} color="#fff" />
                          <Text className="text-white font-semibold text-base">
                            Direkt auf eBay einstellen
                          </Text>
                        </View>
                      </Pressable>
                    ) : (
                      <>
                        <Pressable
                          onPress={connectEbay}
                          className="py-4 rounded-2xl items-center mb-3 active:opacity-80 border-2"
                          style={{ borderColor: meta.color, backgroundColor: meta.color + '15' }}
                        >
                          <View className="flex-row items-center gap-2">
                            <Icons.Tag size={18} color={meta.color} />
                            <Text className="font-semibold text-base" style={{ color: meta.color }}>
                              eBay-Konto verbinden
                            </Text>
                          </View>
                        </Pressable>
                        <Text className="text-foreground-secondary text-xs text-center mb-3">
                          Nach dem Verbinden kannst du direkt inserieren.
                        </Text>
                      </>
                    )
                  ) : (
                    <Pressable
                      onPress={() => handleInsert(false)}
                      className="py-4 rounded-2xl items-center mb-3 active:opacity-80"
                      style={{ backgroundColor: meta.color }}
                    >
                      <View className="flex-row items-center gap-2">
                        <Icons.ExternalLink size={18} color="#fff" />
                        <Text className="text-white font-semibold text-base">
                          Auf {meta.label} inserieren
                        </Text>
                      </View>
                    </Pressable>
                  )}

                  {/* Entwurf speichern */}
                  <Pressable
                    onPress={() => handleInsert(true)}
                    className="py-3.5 rounded-2xl items-center border border-border active:opacity-70"
                  >
                    <Text className="text-foreground-secondary font-medium text-sm">
                      Als Entwurf speichern
                    </Text>
                  </Pressable>
                </ScrollView>
              )}
            </MotiView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
