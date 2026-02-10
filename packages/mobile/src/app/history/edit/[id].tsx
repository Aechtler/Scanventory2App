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

const CONDITION_PRESETS = ['Neu', 'Wie neu', 'Gut', 'Akzeptabel', 'Defekt'];

const PLATFORM_CONFIG = [
  { key: 'generic' as const, label: 'Generisch', icon: 'Search' as const },
  { key: 'ebay' as const, label: 'eBay', icon: 'Globe' as const },
  { key: 'kleinanzeigen' as const, label: 'Kleinanzeigen', icon: 'Store' as const },
  { key: 'amazon' as const, label: 'Amazon', icon: 'Package' as const },
  { key: 'idealo' as const, label: 'Idealo', icon: 'Tag' as const },
];

type SearchQueries = {
  ebay?: string;
  kleinanzeigen?: string;
  amazon?: string;
  idealo?: string;
  generic?: string;
};

export default function ProductEditScreen() {
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
          <Text className="text-white text-lg">Item nicht gefunden</Text>
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
              <Text className="text-white font-semibold">Speichern</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            {/* Bild-Preview */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 300 }}
              className="rounded-xl overflow-hidden mb-6"
            >
              <View style={{ width: '100%', aspectRatio: 16 / 9, overflow: 'hidden' }}>
                <Image
                  source={{ uri: item.cachedImageUri || item.imageUri }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '200%' }}
                  resizeMode="cover"
                />
              </View>
            </MotiView>

            {/* Produktname */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm mb-2 font-medium">Produktname</Text>
              <TextInput
                value={productName}
                onChangeText={setProductName}
                placeholder="Produktname eingeben..."
                placeholderTextColor="#6b7280"
                className="text-white text-xl font-bold bg-gray-800 p-4 rounded-xl"
                multiline
              />
            </View>

            {/* Kategorie */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm mb-2 font-medium">Kategorie</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Kategorie..."
                placeholderTextColor="#6b7280"
                className="text-gray-200 text-base bg-gray-800 p-4 rounded-xl"
              />
            </View>

            {/* Marke */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm mb-2 font-medium">Marke</Text>
              <TextInput
                value={brand}
                onChangeText={setBrand}
                placeholder="Marke (optional)..."
                placeholderTextColor="#6b7280"
                className="text-gray-200 text-base bg-gray-800 p-4 rounded-xl"
              />
            </View>

            {/* Zustand mit Preset-Chips */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm mb-2 font-medium">Zustand</Text>
              <View className="flex-row flex-wrap gap-2">
                {CONDITION_PRESETS.map((preset) => (
                  <Pressable
                    key={preset}
                    onPress={() => setCondition(preset)}
                    className={`px-4 py-3 rounded-xl border ${
                      preset === condition
                        ? 'bg-primary-500/30 border-primary-500'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        preset === condition ? 'text-primary-400 font-semibold' : 'text-gray-200'
                      }`}
                    >
                      {preset}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* GTIN */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm mb-2 font-medium">
                Artikelnummer (GTIN)
              </Text>
              <TextInput
                value={gtin}
                onChangeText={setGtin}
                placeholder="EAN / GTIN eingeben..."
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                className="text-gray-400 text-base font-mono bg-gray-800 p-4 rounded-xl"
              />
            </View>

            {/* Suchbegriffe - Aufklappbar */}
            <View className="mb-5">
              <Pressable
                onPress={() => setShowSearchQueries(!showSearchQueries)}
                className="flex-row items-center justify-between p-4 bg-gray-800 rounded-xl"
              >
                <View className="flex-row items-center gap-3">
                  <Icons.Search size={20} color="#9ca3af" />
                  <Text className="text-gray-200 text-base font-medium">
                    Suchbegriffe anpassen
                  </Text>
                </View>
                {showSearchQueries ? (
                  <Icons.ChevronUp size={20} color="#9ca3af" />
                ) : (
                  <Icons.ChevronDown size={20} color="#9ca3af" />
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
                        <View className="w-10 h-10 bg-gray-700 rounded-lg items-center justify-center">
                          {IconComponent && <IconComponent size={18} color="#9ca3af" />}
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-500 text-xs mb-1">{label}</Text>
                          <TextInput
                            value={searchQueries[key] || ''}
                            onChangeText={(val) => updateSearchQuery(key, val)}
                            placeholder={`${label}-Suchbegriff...`}
                            placeholderTextColor="#4b5563"
                            className="text-gray-200 text-sm bg-gray-800 p-3 rounded-lg"
                          />
                        </View>
                      </View>
                    );
                  })}
                </MotiView>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
