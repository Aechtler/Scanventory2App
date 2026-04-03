/**
 * Market Value Detail Modal
 * Zeigt vollständige KI-Analyse mit Quellen
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';
import { MarketValueResult } from '@/features/market/services/perplexity';
import { confidenceColors } from '@/features/market/components/MarketValue/utils';

interface MarketValueModalProps {
  visible: boolean;
  result: MarketValueResult;
  onClose: () => void;
  onRefresh?: () => void;
}

export function MarketValueModal({
  visible,
  result,
  onClose,
  onRefresh,
}: MarketValueModalProps) {
  const themeColors = useThemeColors();
  const colors = confidenceColors[result.confidence as keyof typeof confidenceColors];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Modal Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View className="flex-row items-center gap-2">
            <Icons.AI size={18} color={themeColors.primaryLight} />
            <Text className="text-white font-semibold text-base">KI-Schätzung</Text>
          </View>
          <Pressable
            onPress={onClose}
            className="bg-background-elevated px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Schließen</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Price + Confidence */}
          <View className="items-center py-6 mb-4">
            <Text className="text-foreground-secondary text-xs mb-1 uppercase tracking-wider">Von – Bis</Text>
            <Text className="text-white text-4xl font-bold text-center">
              {result.priceRange || result.estimatedPrice}
            </Text>
            <View className={`${colors.bg} px-3 py-1 rounded-full mt-3`}>
              <Text className={`${colors.text} text-xs font-semibold uppercase`}>
                Konfidenz: {result.confidence}
              </Text>
            </View>
          </View>

          {/* Summary */}
          {result.summary && (
            <Text className="text-foreground-secondary text-sm leading-6 mb-6">{result.summary}</Text>
          )}

          {/* Sources */}
          {result.sources.length > 0 && (
            <View className="mb-6">
              <Text className="text-foreground-secondary text-xs font-medium mb-2 uppercase tracking-wider">Quellen</Text>
              {result.sources.map((source: string, i: number) => (
                <Text key={i} className="text-foreground-secondary text-xs py-1 border-b border-border/30">{source}</Text>
              ))}
            </View>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Pressable
              onPress={() => {
                onRefresh();
                onClose();
              }}
              className="bg-purple-600 py-3.5 px-6 rounded-xl items-center mb-6"
            >
              <View className="flex-row items-center gap-2">
                <Icons.Refresh size={16} color={themeColors.textPrimary} />
                <Text className="text-white font-medium">Neu recherchieren</Text>
              </View>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
