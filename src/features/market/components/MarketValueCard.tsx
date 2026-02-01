/**
 * Market Value Card Component
 * Zeigt die KI-basierte Marktwertanalyse von Perplexity an
 */

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { MarketValueResult } from '../services/perplexityService';

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
      <Pressable 
        onPress={() => setExpanded(!expanded)}
        className="items-center py-3"
      >
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
      </Pressable>

      {/* Summary */}
      <View className="bg-gray-800/50 rounded-lg p-3 mt-2">
        <Text 
          className="text-gray-300 text-sm leading-5"
          numberOfLines={expanded ? undefined : 3}
        >
          {result.summary}
        </Text>
        {result.summary.length > 120 && (
          <Pressable onPress={() => setExpanded(!expanded)}>
            <Text className="text-purple-400 text-sm mt-2">
              {expanded ? 'Weniger anzeigen ▲' : 'Mehr anzeigen ▼'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Sources */}
      {result.sources.length > 0 && expanded && (
        <View className="mt-3">
          <Text className="text-gray-500 text-xs mb-1">Quellen:</Text>
          <View className="flex-row flex-wrap gap-1">
            {result.sources.slice(0, 3).map((source, i) => (
              <View key={i} className="bg-gray-700/50 px-2 py-1 rounded">
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {source}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Pressable 
          onPress={onRefresh}
          className="mt-3 py-2 items-center"
        >
          <Text className="text-purple-400 text-sm">🔄 Neu recherchieren</Text>
        </Pressable>
      )}

      {/* Disclaimer */}
      <Text className="text-gray-600 text-xs text-center mt-2">
        Powered by Perplexity AI • Keine Gewährleistung
      </Text>
    </MotiView>
  );
}
