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
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useHistoryStore } from '@/features/history/store/historyStore';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useTabBarPadding } from '@/shared/hooks/useTabBarPadding';
import { CategoryPickerField } from '@/features/categories';
import type { CategoryNode } from '@/features/categories';

const CONDITION_PRESETS = ['Neu', 'Wie neu', 'Gut', 'Akzeptabel', 'Defekt'];


export default function ProductEditScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useHistoryStore((state) => id ? state.items.find((i) => i.id === id) : undefined) ?? null;
  const updateItem = useHistoryStore((state) => state.updateItem);

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryPath, setCategoryPath] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [conditionNote, setConditionNote] = useState('');
  const [gtin, setGtin] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const tabBarPadding = useTabBarPadding();

  async function pickImage(source: 'camera' | 'gallery') {
    const permResult =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert(
        'Berechtigung benötigt',
        `Bitte erlaube den Zugriff auf ${source === 'camera' ? 'die Kamera' : 'deine Fotos'}.`
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri);
    }
  }

  function handleImagePress() {
    Alert.alert('Bild ändern', 'Wähle eine Option', [
      { text: 'Kamera', onPress: () => pickImage('camera') },
      { text: 'Galerie', onPress: () => pickImage('gallery') },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  }

  // Init state from item
  useEffect(() => {
    if (item) {
      setProductName(item.productName);
      setCategory(item.category);
      setCategoryId(item.categoryId ?? null);
      setCategoryPath(item.categoryPath ?? null);
      setBrand(item.brand || '');
      setCondition(item.condition);
      setConditionNote(item.conditionNote || '');
      setGtin(item.gtin || '');
    }
  }, [item?.id]);

  const handleSave = () => {
    if (!id || !item) return;

    const changes: Record<string, unknown> = {};

    if (productName !== item.productName) changes.productName = productName;
    if (category !== item.category) changes.category = category;
    if (categoryId !== (item.categoryId ?? null)) changes.categoryId = categoryId;
    if (categoryPath !== (item.categoryPath ?? null)) changes.categoryPath = categoryPath;
    if (brand !== (item.brand || '')) changes.brand = brand || null;
    if (condition !== item.condition) changes.condition = condition;
    if (conditionNote !== (item.conditionNote || '')) changes.conditionNote = conditionNote || null;
    if (gtin !== (item.gtin || '')) changes.gtin = gtin || null;

    if (localImageUri) {
      changes.imageUri = localImageUri;
      changes.cachedImageUri = localImageUri;
    }

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
          >
            {/* Bild-Preview */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rounded-2xl overflow-hidden mb-6"
            >
              <Pressable onPress={handleImagePress}>
                <View style={{ width: '100%', aspectRatio: 4 / 3, overflow: 'hidden', backgroundColor: '#0d1117' }}>
                  <Image
                    source={{ uri: localImageUri || item.cachedImageUri || item.imageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </View>
                <View
                  className="absolute bottom-3 right-3 bg-black/60 rounded-full items-center justify-center"
                  style={{ width: 36, height: 36 }}
                >
                  <Icons.Camera size={18} color="#fff" />
                </View>
              </Pressable>
            </MotiView>

            {/* Formular */}
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
              <CategoryPickerField
                value={categoryPath}
                categoryId={categoryId}
                onSelect={(node: CategoryNode, path: string) => {
                  setCategoryId(node.id);
                  setCategoryPath(path);
                  setCategory(node.name);
                }}
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

            {/* Zustandsbeschreibung */}
            <View className="mb-5">
              <Text className="text-foreground-secondary text-sm mb-2 font-medium">Zustandsbeschreibung</Text>
              <TextInput
                value={conditionNote}
                onChangeText={setConditionNote}
                placeholder="z. B. hat Kratzer, Teile fehlen..."
                placeholderTextColor={colors.textSecondary}
                className="text-foreground text-base bg-background-elevated p-4 rounded-xl"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
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

</>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
