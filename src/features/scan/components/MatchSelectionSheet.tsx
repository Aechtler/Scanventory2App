import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { VisionMatch } from '@/features/scan/services/visionService';

interface MatchSelectionSheetProps {
  visible: boolean;
  matches: VisionMatch[];
  onSelect: (index: number) => void;
  onManualEntry: () => void;
}

/**
 * Bottom Sheet zur Auswahl des richtigen Produkttreffers
 */
export function MatchSelectionSheet({
  visible,
  matches,
  onSelect,
  onManualEntry,
}: MatchSelectionSheetProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Sehr sicher';
    if (confidence >= 0.6) return 'Wahrscheinlich';
    return 'Möglich';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background-card rounded-t-3xl p-6 max-h-[80%]">
          {/* Header */}
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-gray-600 rounded-full mb-4" />
            <Text className="text-white text-xl font-bold">
              Was ist das?
            </Text>
            <Text className="text-gray-400 mt-1">
              Wähle die beste Übereinstimmung
            </Text>
          </View>

          {/* Matches Liste */}
          <ScrollView className="max-h-96">
            {matches.map((match, index) => (
              <Pressable
                key={index}
                onPress={() => onSelect(index)}
                className="bg-background rounded-xl p-4 mb-3 border-2 border-transparent active:border-primary-500"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-3">
                    <Text className="text-white font-semibold text-base" numberOfLines={2}>
                      {match.productName}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
                      {match.description}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className={`font-bold ${getConfidenceColor(match.confidence)}`}>
                      {Math.round(match.confidence * 100)}%
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {getConfidenceLabel(match.confidence)}
                    </Text>
                  </View>
                </View>

                {/* Tags */}
                <View className="flex-row flex-wrap gap-2 mt-3">
                  <View className="bg-gray-700 px-2 py-1 rounded">
                    <Text className="text-gray-300 text-xs">{match.category}</Text>
                  </View>
                  {match.brand && (
                    <View className="bg-gray-700 px-2 py-1 rounded">
                      <Text className="text-gray-300 text-xs">{match.brand}</Text>
                    </View>
                  )}
                  <View className="bg-gray-700 px-2 py-1 rounded">
                    <Text className="text-gray-300 text-xs">{match.condition}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* Manual Entry Button */}
          <Pressable
            onPress={onManualEntry}
            className="mt-4 border border-gray-600 rounded-xl p-4 active:bg-background"
          >
            <Text className="text-gray-400 text-center">
              Keiner passt – manuell eingeben
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
