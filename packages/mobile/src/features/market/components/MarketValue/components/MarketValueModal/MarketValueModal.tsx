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
          <View className="flex-row items-center gap-3">
            <Icons.AI size={24} color={themeColors.primaryLight} />
            <Text className="text-white font-bold text-lg">KI-Analyse Details</Text>
          </View>
          <Pressable
            onPress={onClose}
            className="bg-background-elevated px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Schließen</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Price Summary */}
          <View className="bg-purple-900/30 rounded-xl p-4 mb-4 border border-purple-500/30">
            <Text className="text-purple-300 text-sm mb-2">
              Geschätzter Marktwert
            </Text>
            <Text className="text-white text-4xl font-bold text-center">
              {result.estimatedPrice}
            </Text>
            {result.priceRange && (
              <Text className="text-purple-400 text-center mt-2">
                Spanne: {result.priceRange}
              </Text>
            )}
            <View
              className={`${colors.bg} ${colors.border} border px-3 py-2 rounded-lg mt-3 self-center`}
            >
              <Text className={`${colors.text} font-medium`}>
                Konfidenz: {result.confidence}
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-background-elevated/50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Icons.FileText size={18} color={themeColors.textPrimary} />
              <Text className="text-white font-semibold ml-2">
                Zusammenfassung
              </Text>
            </View>
            <Text className="text-foreground-secondary leading-6">{result.summary}</Text>
          </View>

          {/* Sources */}
          {result.sources.length > 0 && (
            <View className="bg-background-elevated/50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Icons.ExternalLink size={16} color={themeColors.textPrimary} />
                <Text className="text-white font-semibold ml-2">Quellen</Text>
              </View>
              {result.sources.map((source: string, i: number) => (
                <View key={i} className="bg-background-elevated/50 px-3 py-2 rounded-lg mb-2">
                  <Text className="text-foreground-secondary text-sm">{source}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Raw Response */}
          <View className="bg-background-elevated/50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Icons.Terminal size={18} color={themeColors.textPrimary} />
              <Text className="text-white font-semibold ml-2">
                Komplette KI-Antwort
              </Text>
            </View>
            <Text className="text-foreground-secondary text-xs mb-3">
              Die vollständige Recherche von Perplexity AI:
            </Text>
            <View className="bg-background/80 rounded-lg p-3">
              <Text className="text-foreground-secondary text-sm leading-6 font-mono">
                {result.rawResponse}
              </Text>
            </View>
          </View>

          {/* Refresh Button */}
          {onRefresh && (
            <Pressable
              onPress={() => {
                onRefresh();
                onClose();
              }}
              className="bg-purple-600 py-4 px-6 rounded-xl items-center mb-6"
            >
              <View className="flex-row items-center">
                <Icons.Refresh size={18} color={themeColors.textPrimary} />
                <Text className="text-white font-semibold ml-2">
                  Neu recherchieren
                </Text>
              </View>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
