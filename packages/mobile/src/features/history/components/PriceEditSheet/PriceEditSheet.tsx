/**
 * PriceEditSheet - Kompaktes Bottom-Sheet Modal zum Preis editieren
 * Minimalistisch: grosser Preis-Input + optionale Notiz
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { PriceEditSheetProps } from './types';

export function PriceEditSheet({
  visible,
  currentPrice,
  currentNote,
  onSave,
  onClose,
}: PriceEditSheetProps) {
  const [priceDraft, setPriceDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const priceInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setPriceDraft(currentPrice !== undefined ? currentPrice.toString() : '');
      setNoteDraft(currentNote || '');
      setTimeout(() => priceInputRef.current?.focus(), 300);
    }
  }, [visible]);

  const handleSave = () => {
    const parsed = parseFloat(priceDraft.replace(',', '.'));
    const price = !isNaN(parsed) && parsed >= 0 ? parsed : undefined;
    onSave(price, noteDraft.trim());
    onClose();
  };

  const handleClear = () => {
    onSave(undefined, '');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable onPress={onClose} className="flex-1 bg-black/60 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Sheet */}
          <Pressable onPress={() => {}}>
            <MotiView
              from={{ translateY: 200, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-gray-900 rounded-t-3xl px-6 pt-4 pb-8 border-t border-gray-700/50"
            >
              {/* Handle Bar */}
              <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-lg font-semibold">
                  Verkaufspreis
                </Text>
                {currentPrice !== undefined && (
                  <Pressable onPress={handleClear} hitSlop={8}>
                    <Text className="text-gray-500 text-sm">Zurücksetzen</Text>
                  </Pressable>
                )}
              </View>

              {/* Preis-Input — gross und zentral */}
              <View className="flex-row items-baseline justify-center mb-4">
                <TextInput
                  ref={priceInputRef}
                  value={priceDraft}
                  onChangeText={setPriceDraft}
                  onSubmitEditing={handleSave}
                  placeholder="0"
                  placeholderTextColor="#4b5563"
                  keyboardType="decimal-pad"
                  className="text-white text-5xl font-bold text-center min-w-[120px]"
                  style={{ textAlign: 'center' }}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                <Text className="text-gray-400 text-2xl font-medium ml-1">€</Text>
              </View>

              {/* Notiz */}
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Notiz (optional)"
                placeholderTextColor="#4b5563"
                className="text-gray-300 text-sm bg-gray-800/60 px-4 py-3 rounded-xl mb-5"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                blurOnSubmit
              />

              {/* Speichern */}
              <Pressable
                onPress={handleSave}
                className="bg-emerald-600 py-4 rounded-2xl items-center active:bg-emerald-700"
              >
                <Text className="text-white font-semibold text-base">
                  Speichern
                </Text>
              </Pressable>
            </MotiView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
