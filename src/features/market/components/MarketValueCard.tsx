/**
 * Market Value Card Component
 * Zeigt die KI-basierte Marktwertanalyse von Perplexity an
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { MotiView } from 'moti';
import { MarketValueResult } from '../services/perplexity';

interface MarketValueCardProps {
  result: MarketValueResult | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

/**
 * Zeigt Perplexity Marktwert-Analyse an
 */
export function MarketValueCard({ result, isLoading, onRefresh }: MarketValueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Loading State
  if (isLoading) {
    return (
      <View className="bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-500/30">
        <View className="flex-row items-center">
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{ type: 'timing', duration: 1200, loop: true }}
          >
            <Text className="text-2xl mr-3">🤖</Text>
          </MotiView>
          <View className="flex-1">
            <Text className="text-white font-semibold">KI recherchiert Marktwert...</Text>
            <Text className="text-purple-300 text-sm mt-1">
              Durchsuche eBay, Amazon, Kleinanzeigen...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // No data
  if (!result) {
    return null;
  }

  const confidenceColors = {
    hoch: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    mittel: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    niedrig: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const colors = confidenceColors[result.confidence];

  return (
    <>
      <Pressable onPress={() => setShowDetails(true)}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
          className="bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-500/30"
        >
          {/* Header */}
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">🤖</Text>
            <Text className="text-white font-semibold text-lg">KI-Marktwertanalyse</Text>
            <View className="ml-auto flex-row items-center gap-2">
              <View className={`${colors.bg} ${colors.border} border px-2 py-1 rounded`}>
                <Text className={`${colors.text} text-xs font-medium`}>
                  {result.confidence === 'hoch' ? '✓ ' : result.confidence === 'niedrig' ? '? ' : ''}
                  {result.confidence}
                </Text>
              </View>
            </View>
          </View>

          {/* Main Price */}
          <View className="items-center py-3">
            <Text className="text-purple-300 text-sm mb-1">Geschätzter Marktwert</Text>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 100, stiffness: 400 }}
            >
              <Text className="text-white text-3xl font-bold">
                {result.estimatedPrice}
              </Text>
            </MotiView>
            {result.priceRange && (
              <Text className="text-purple-400 text-sm mt-1">
                Spanne: {result.priceRange}
              </Text>
            )}
          </View>

          {/* Summary Preview */}
          <View className="bg-gray-800/50 rounded-lg p-3 mt-2">
            <Text 
              className="text-gray-300 text-sm leading-5"
              numberOfLines={2}
            >
              {result.summary}
            </Text>
            <Text className="text-purple-400 text-xs mt-2">
              Tippen für Details ▼
            </Text>
          </View>

          {/* Disclaimer */}
          <Text className="text-gray-600 text-xs text-center mt-2">
            Powered by Perplexity AI • Keine Gewährleistung
          </Text>
        </MotiView>
      </Pressable>

      {/* Detail Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View className="flex-1 bg-gray-900">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">🤖</Text>
              <Text className="text-white font-bold text-lg">KI-Analyse Details</Text>
            </View>
            <Pressable 
              onPress={() => setShowDetails(false)}
              className="bg-gray-800 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Schließen</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Price Summary */}
            <View className="bg-purple-900/30 rounded-xl p-4 mb-4 border border-purple-500/30">
              <Text className="text-purple-300 text-sm mb-2">Geschätzter Marktwert</Text>
              <Text className="text-white text-4xl font-bold text-center">
                {result.estimatedPrice}
              </Text>
              {result.priceRange && (
                <Text className="text-purple-400 text-center mt-2">
                  Spanne: {result.priceRange}
                </Text>
              )}
              <View className={`${colors.bg} ${colors.border} border px-3 py-2 rounded-lg mt-3 self-center`}>
                <Text className={`${colors.text} font-medium`}>
                  Konfidenz: {result.confidence}
                </Text>
              </View>
            </View>

            {/* Summary */}
            <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <Text className="text-white font-semibold mb-2">📋 Zusammenfassung</Text>
              <Text className="text-gray-300 leading-6">
                {result.summary}
              </Text>
            </View>

            {/* Sources */}
            {result.sources.length > 0 && (
              <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <Text className="text-white font-semibold mb-2">🔗 Quellen</Text>
                {result.sources.map((source, i) => (
                  <View key={i} className="bg-gray-700/50 px-3 py-2 rounded-lg mb-2">
                    <Text className="text-gray-300 text-sm">{source}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Raw Response */}
            <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <Text className="text-white font-semibold mb-2">📝 Komplette KI-Antwort</Text>
              <Text className="text-gray-400 text-xs mb-3">
                Die vollständige Recherche von Perplexity AI:
              </Text>
              <View className="bg-gray-900/80 rounded-lg p-3">
                <Text className="text-gray-300 text-sm leading-6 font-mono">
                  {result.rawResponse}
                </Text>
              </View>
            </View>

            {/* Refresh Button */}
            {onRefresh && (
              <Pressable 
                onPress={() => {
                  onRefresh();
                  setShowDetails(false);
                }}
                className="bg-purple-600 py-4 px-6 rounded-xl items-center mb-6"
              >
                <Text className="text-white font-semibold">🔄 Neu recherchieren</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
