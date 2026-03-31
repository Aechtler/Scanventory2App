/**
 * Product Edit Screen - Eigene Seite zum Bearbeiten der Produktdaten
 * Navigation: history/[id] → history/edit/[id]
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useHistoryStore } from '@/features/history/store/historyStore';
import { useUIStore } from '@/shared/store/uiStore';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useTabBarPadding } from '@/shared/hooks/useTabBarPadding';

const CONDITION_PRESETS = ['Neu', 'Wie neu', 'Gut', 'Akzeptabel', 'Defekt'];

const PLATFORM_CONFIG = [
  { key: 'generic' as const, label: 'Generisch', icon: 'Search' as const },
  { key: 'ebay' as const, label: 'eBay', icon: 'Globe' as const },
  { key: 'amazon' as const, label: 'Amazon', icon: 'Package' as const },
  { key: 'idealo' as const, label: 'Idealo', icon: 'Tag' as const },
];

type SearchQueries = {
  ebay?: string;
  amazon?: string;
  idealo?: string;
  generic?: string;
};

export default function ProductEditScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useHistoryStore((state) => id ? state.items.find((i) => i.id === id) : undefined) ?? null;
  const updateItem = useHistoryStore((state) => state.updateItem);

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [gtin, setGtin] = useState('');
  const [searchQueries, setSearchQueries] = useState<SearchQueries>({});
  const [showSearchQueries, setShowSearchQueries] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const tabBarPadding = useTabBarPadding();
  const setTabBarHidden = useUIStore((s) => s.setTabBarHidden);

  const toggleImageExpanded = (expanded: boolean) => {
    setImageExpanded(expanded);
    setTabBarHidden(expanded);
  };

  // Tab Bar zurücksetzen beim Verlassen des Screens
  useEffect(() => {
    return () => setTabBarHidden(false);
  }, []);

  // Init state from item
  useEffect(() => {
    if (item) {
      setProductName(item.productName);
      setCategory(item.category);
      setBrand(item.brand || '');
      setCondition(item.condition);
      setGtin(item.gtin || '');
      setSearchQueries(item.searchQueries || {});
    }
  }, [item?.id]);

  const handleSave = () => {
    if (!id || !item) return;

    const changes: Record<string, unknown> = {};

    if (productName !== item.productName) changes.productName = productName;
    if (category !== item.category) changes.category = category;
    if (brand !== (item.brand || '')) changes.brand = brand || null;
    if (condition !== item.condition) changes.condition = condition;
    if (gtin !== (item.gtin || '')) changes.gtin = gtin || null;

    const queriesChanged = Object.keys(searchQueries).some(
      (key) =>
        searchQueries[key as keyof SearchQueries] !==
        item.searchQueries?.[key as keyof SearchQueries]
    );
    if (queriesChanged) changes.searchQueries = searchQueries;

    if (Object.keys(changes).length > 0) {
      updateItem(id, changes);
    }

    router.replace(`/history/${id}`);
  };

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: 'Nicht gefunden' }} />
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
          <Text className="text-foreground text-lg">Item nicht gefunden</Text>
        </SafeAreaView>
      </>
    );
  }

  const updateSearchQuery = (key: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bearbeiten',
          headerBackTitle: 'Details',
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              className="px-4 py-2 rounded-full bg-primary-500 active:bg-primary-600"
            >
              <Text className="text-foreground font-semibold">Speichern</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, flexGrow: 1, paddingBottom: tabBarPadding }}
            scrollEnabled={!imageExpanded}
          >
            {/* Bild-Preview mit Expand-Toggle */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 300 }}
              className="rounded-xl overflow-hidden mb-6"
              style={imageExpanded ? { flex: 1 } : undefined}
            >
              <View
                style={
                  imageExpanded
                    ? { flex: 1, overflow: 'hidden' }
                    : { width: '100%', aspectRatio: 16 / 9, overflow: 'hidden' }
                }
              >
                <Image
                  source={{ uri: item.cachedImageUri || item.imageUri }}
                  style={
                    imageExpanded
                      ? { width: '100%', height: '100%' }
                      : { position: 'absolute', top: 0, left: 0, right: 0, height: '200%' }
                  }
                  resizeMode={imageExpanded ? 'contain' : 'cover'}
                />
              </View>

              {/* Toggle-Bar */}
              <Pressable
                onPress={() => toggleImageExpanded(!imageExpanded)}
                className="flex-row items-center justify-center py-2 bg-background-elevated/90"
                style={{ gap: 6 }}
              >
                {imageExpanded ? (
                  <>
                    <Icons.Minimize size={14} color={colors.primaryLight} />
                    <Text className="text-primary-400 text-xs font-medium">
                      Details einblenden
                    </Text>
                  </>
                ) : (
                  <>
                    <Icons.Maximize size={14} color={colors.primaryLight} />
                    <Text className="text-primary-400 text-xs font-medium">
                      Bild vergrößern
                    </Text>
                  </>
                )}
              </Pressable>
            </MotiView>

            {/* Formular - ausgeblendet im Fullscreen-Modus */}
            {!imageExpanded && (
            <>
            {/* Produktname */}
            <View className="mb-5">
              <Text className="text-foreground-secondary text-sm mb-2 font-medium">Produktname</Text>
              <TextInput
                value={productName}
                onChangeText={setProductName}
                placeholder="Produktname eingeben..."
                placeholderTextColor={colors.textSecondary}
                className="text-foreground text-xl font-bold bg-background-elevated p-4 rounded-xl"
                multiline
              />
            </View>

            {/* Kategorie */}
            <View className="mb-5">
              <Text className="text-foreground-secondary text-sm mb-2 font-medium">Kategorie</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Kategorie..."
                placeholderTextColor={colors.textSecondary}
                className="text-foreground text-base bg-background-elevated p-4 rounded-xl"
              />
            </View>

            {/* Marke */}
            <View className="mb-5">
              <Text className="text-foreground-secondary text-sm mb-2 font-medium">Marke</Text>
              <TextInput
                value={brand}
                onChangeText={setBrand}
                placeholder="Marke (optional)..."
                placeholderTextColor={colors.textSecondary}
                className="text-foreground text-base bg-background-elevated p-4 rounded-xl"
              />
            </View>

            {/* Zustand - Dropdown */}
            <View className="mb-5">
              <Text className="text-foreground-secondary text-sm mb-2 font-medium">Zustand</Text>
              <Pressable
                onPress={() => setConditionOpen(!conditionOpen)}
                className="flex-row items-center justify-between bg-background-elevated p-4 rounded-xl"
              >
                <Text className="text-foreground text-base">{condition}</Text>
                {conditionOpen
                  ? <Icons.ChevronUp size={20} color={colors.textSecondary} />
                  : <Icons.ChevronDown size={20} color={colors.textSecondary} />
                }
              </Pressable>
              {conditionOpen && (
                <MotiView
                  from={{ opacity: 0, translateY: -6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 180 }}
                  className="mt-1 bg-background-elevated rounded-xl overflow-hidden border border-border/50"
                >
                  {CONDITION_PRESETS.map((preset, i) => (
                    <Pressable
                      key={preset}
                      onPress={() => { setCondition(preset); setConditionOpen(false); }}
                      className={`flex-row items-center justify-between px-4 py-3 ${
                        i < CONDITION_PRESETS.length - 1 ? 'border-b border-border/30' : ''
                      } ${preset === condition ? 'bg-primary-500/15' : ''}`}
                    >
                      <Text className={`text-base ${preset === condition ? 'text-primary-400 font-medium' : 'text-foreground'}`}>
                        {preset}
                      </Text>
                      {preset === condition && <Icons.Check size={18} color={colors.primary} />}
                    </Pressable>
                  ))}
                </MotiView>
              )}
            </View>

            {/* GTIN */}
            <View className="mb-5">
              <Text className="text-foreground-secondary text-sm mb-2 font-medium">
                Artikelnummer (GTIN)
              </Text>
              <TextInput
                value={gtin}
                onChangeText={setGtin}
                placeholder="EAN / GTIN eingeben..."
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                className="text-foreground-secondary text-base font-mono bg-background-elevated p-4 rounded-xl"
              />
            </View>

            {/* Suchbegriffe - Aufklappbar */}
            <View className="mb-5">
              <Pressable
                onPress={() => setShowSearchQueries(!showSearchQueries)}
                className="flex-row items-center justify-between p-4 bg-background-elevated rounded-xl"
              >
                <View className="flex-row items-center gap-3">
                  <Icons.Search size={20} color={colors.textSecondary} />
                  <Text className="text-foreground text-base font-medium">
                    Suchbegriffe anpassen
                  </Text>
                </View>
                {showSearchQueries ? (
                  <Icons.ChevronUp size={20} color={colors.textSecondary} />
                ) : (
                  <Icons.ChevronDown size={20} color={colors.textSecondary} />
                )}
              </Pressable>

              {showSearchQueries && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 200 }}
                  className="mt-3 gap-3"
                >
                  {PLATFORM_CONFIG.map(({ key, label, icon }) => {
                    const IconComponent = Icons[icon];
                    return (
                      <View key={key} className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-background-elevated rounded-lg items-center justify-center">
                          {IconComponent && <IconComponent size={18} color={colors.textSecondary} />}
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground-secondary text-xs mb-1">{label}</Text>
                          <TextInput
                            value={searchQueries[key] || ''}
                            onChangeText={(val) => updateSearchQuery(key, val)}
                            placeholder={`${label}-Suchbegriff...`}
                            placeholderTextColor={colors.textSecondary}
                            className="text-foreground text-sm bg-background-elevated p-3 rounded-lg"
                          />
                        </View>
                      </View>
                    );
                  })}
                </MotiView>
              )}
            </View>
            </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
