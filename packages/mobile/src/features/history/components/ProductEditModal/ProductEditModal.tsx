/**
 * ProductEditModal - Fullscreen Edit Modal für Produktdaten
 * Öffnet sich bei Tap auf das Produktbild
 * Enthält: Titel, Kategorie, Marke, Zustand, GTIN, Suchbegriffe
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { Button } from '@/shared/components';

export interface ProductEditData {
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  gtin?: string | null;
  searchQueries?: {
    ebay?: string;
    amazon?: string;
    idealo?: string;
    generic?: string;
  };
}

interface ProductEditModalProps {
  visible: boolean;
  imageUri: string;
  initialData: ProductEditData;
  onSave: (data: Partial<ProductEditData>) => void;
  onClose: () => void;
}

const CONDITION_PRESETS = ['Neu', 'Wie neu', 'Gut', 'Akzeptabel', 'Defekt'];

const PLATFORM_CONFIG = [
  { key: 'generic' as const, label: 'Generisch', icon: 'Search' },
  { key: 'ebay' as const, label: 'eBay', icon: 'Globe' },
  { key: 'amazon' as const, label: 'Amazon', icon: 'Package' },
  { key: 'idealo' as const, label: 'Idealo', icon: 'Tag' },
];

export function ProductEditModal({
  visible,
  imageUri,
  initialData,
  onSave,
  onClose,
}: ProductEditModalProps) {
  // Local state für alle editierbaren Felder
  const [productName, setProductName] = useState(initialData.productName);
  const [category, setCategory] = useState(initialData.category);
  const [brand, setBrand] = useState(initialData.brand || '');
  const [condition, setCondition] = useState(initialData.condition);
  const [gtin, setGtin] = useState(initialData.gtin || '');
  const [searchQueries, setSearchQueries] = useState(initialData.searchQueries || {});
  const [showSearchQueries, setShowSearchQueries] = useState(false);

  // Reset state when modal opens with new data
  useEffect(() => {
    if (visible) {
      setProductName(initialData.productName);
      setCategory(initialData.category);
      setBrand(initialData.brand || '');
      setCondition(initialData.condition);
      setGtin(initialData.gtin || '');
      setSearchQueries(initialData.searchQueries || {});
    }
  }, [visible, initialData]);

  const handleSave = () => {
    const changes: Partial<ProductEditData> = {};
    
    if (productName !== initialData.productName) {
      changes.productName = productName;
    }
    if (category !== initialData.category) {
      changes.category = category;
    }
    if (brand !== (initialData.brand || '')) {
      changes.brand = brand || null;
    }
    if (condition !== initialData.condition) {
      changes.condition = condition;
    }
    if (gtin !== (initialData.gtin || '')) {
      changes.gtin = gtin || null;
    }
    // Check if searchQueries changed
    const queriesChanged = Object.keys(searchQueries).some(
      key => searchQueries[key as keyof typeof searchQueries] !== 
             initialData.searchQueries?.[key as keyof typeof searchQueries]
    );
    if (queriesChanged) {
      changes.searchQueries = searchQueries;
    }

    onSave(changes);
    onClose();
  };

  const updateSearchQuery = (key: string, value: string) => {
    setSearchQueries(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Glass Header - Fixed with proper hit areas */}
          <View className="z-10">
            <BlurView 
              intensity={60} 
              tint="dark" 
              className="overflow-hidden border-b border-white/10"
            >
              <View className="flex-row items-center justify-between px-4 py-4 min-h-[60px] bg-gray-900/40">
                {/* Close Button - larger touch target */}
                <Pressable
                  onPress={onClose}
                  className="w-12 h-12 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ zIndex: 100 }}
                >
                  <Icons.Close size={22} color="#ffffff" />
                </Pressable>

                {/* Title */}
                <Text className="text-white text-lg font-semibold flex-shrink">Bearbeiten</Text>

                {/* Save Button - ensure no overlap */}
                <Pressable
                  onPress={handleSave}
                  className="px-5 py-3 rounded-full bg-primary-500 active:bg-primary-600"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ zIndex: 100 }}
                >
                  <Text className="text-white font-semibold">Speichern</Text>
                </Pressable>
              </View>
            </BlurView>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            {/* Bild-Preview */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 300 }}
              className="rounded-xl overflow-hidden mb-6"
            >
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                resizeMode="cover"
              />
            </MotiView>

            {/* Produktname - Großes Eingabefeld */}
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

            {/* Tags: Kategorie, Marke, Zustand */}
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
              <Text className="text-gray-400 text-sm mb-2 font-medium">Artikelnummer (GTIN)</Text>
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
                  <Text className="text-gray-200 text-base font-medium">Suchbegriffe anpassen</Text>
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
                    const IconComponent = Icons[icon as keyof typeof Icons];
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
    </Modal>
  );
}
