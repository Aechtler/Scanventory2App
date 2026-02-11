/**
 * FinalPriceCard - "Mein Verkaufspreis" mit grossem Input
 * Gruene Akzentfarbe, Vergleichszeile zu KI/eBay/KA Preisen
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { FinalPriceCardProps } from './types';

export function FinalPriceCard({
  finalPrice,
  finalPriceNote,
  comparison,
  onSavePrice,
  onSaveNote,
}: FinalPriceCardProps) {
  const colors = useThemeColors();
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState(
    finalPrice !== undefined ? finalPrice.toString() : ''
  );
  const [noteDraft, setNoteDraft] = useState(finalPriceNote || '');
  const priceInputRef = useRef<TextInput>(null);
  const noteInputRef = useRef<TextInput>(null);

  const handlePriceTap = () => {
    setPriceDraft(finalPrice !== undefined ? finalPrice.toString() : '');
    setEditingPrice(true);
    setTimeout(() => priceInputRef.current?.focus(), 50);
  };

  const handlePriceSave = () => {
    setEditingPrice(false);
    const cleaned = priceDraft.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed >= 0) {
      onSavePrice(parsed);
    } else if (priceDraft.trim() === '') {
      onSavePrice(undefined);
    }
  };

  const handleNoteSave = () => {
    const trimmed = noteDraft.trim();
    if (trimmed !== (finalPriceNote || '')) {
      onSaveNote(trimmed);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const hasComparison =
    comparison?.aiPrice || comparison?.ebayAvg;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-emerald-900/20 rounded-xl p-4 mb-4 border border-emerald-500/30"
    >
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <Icons.Coins size={18} color="#10b981" />
        <Text className="text-emerald-400 font-semibold text-sm ml-2">
          Mein Verkaufspreis
        </Text>
      </View>

      {/* Grosser Preis-Input */}
      <Pressable onPress={handlePriceTap} disabled={editingPrice}>
        <View className="flex-row items-baseline">
          {editingPrice ? (
            <TextInput
              ref={priceInputRef}
              value={priceDraft}
              onChangeText={setPriceDraft}
              onBlur={handlePriceSave}
              onSubmitEditing={handlePriceSave}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              className="text-white text-4xl font-bold flex-1"
              returnKeyType="done"
              blurOnSubmit
            />
          ) : (
            <Text className="text-white text-4xl font-bold flex-1">
              {finalPrice !== undefined ? formatPrice(finalPrice) : '—'}
            </Text>
          )}
          <Text className="text-foreground-secondary text-lg ml-2">EUR</Text>
          {!editingPrice && (
            <Icons.Pencil size={14} color={colors.textSecondary} strokeWidth={1.5} />
          )}
        </View>
      </Pressable>

      {/* Vergleichszeile */}
      {hasComparison && (
        <View className="flex-row flex-wrap gap-x-3 mt-2">
          {comparison?.aiPrice !== undefined && (
            <Text className="text-foreground-secondary text-xs">
              KI: {typeof comparison.aiPrice === 'number' ? formatPrice(comparison.aiPrice) + '€' : comparison.aiPrice}
            </Text>
          )}
          {comparison?.ebayAvg !== undefined && (
            <Text className="text-foreground-secondary text-xs">
              eBay: {formatPrice(comparison.ebayAvg)}€
            </Text>
          )}
        </View>
      )}

      {/* Notiz-Feld */}
      <View className="mt-3">
        <TextInput
          ref={noteInputRef}
          value={noteDraft}
          onChangeText={setNoteDraft}
          onBlur={handleNoteSave}
          onSubmitEditing={handleNoteSave}
          placeholder="Notiz hinzufügen..."
          placeholderTextColor={colors.textSecondary}
          className="text-foreground-secondary text-sm border-b border-border pb-1"
          returnKeyType="done"
          blurOnSubmit
        />
      </View>
    </MotiView>
  );
}
