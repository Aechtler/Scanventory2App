import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { MotiView } from 'moti';
import { VisionMatch } from '@/features/scan/services/visionService';
import { AnimatedButton } from '@/shared/components/Animated';

interface MatchSelectionSheetProps {
  visible: boolean;
  matches: VisionMatch[];
  onSelect: (index: number) => void;
  onManualEntry: () => void;
}

/**
 * Premium Bottom Sheet mit Animationen für Produktauswahl
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

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500/20';
    if (confidence >= 0.6) return 'bg-yellow-500/20';
    return 'bg-orange-500/20';
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
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View className="flex-1 justify-end bg-black/60">
        {/* Animated Sheet */}
        <MotiView
          from={{ translateY: 400 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-background-card rounded-t-3xl p-6 max-h-[85%]"
        >
          {/* Handle Bar */}
          <MotiView
            from={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            className="self-center h-1 bg-gray-600 rounded-full mb-5"
          />

          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 100 }}
            className="items-center mb-5"
          >
            <Text className="text-white text-2xl font-bold">
              🔍 Was ist das?
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
              Wähle die beste Übereinstimmung aus
            </Text>
          </MotiView>

          {/* Matches Liste mit Stagger */}
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            {matches.map((match, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: 'spring',
                  damping: 18,
                  stiffness: 200,
                  delay: 200 + index * 100,
                }}
              >
                <AnimatedButton
                  onPress={() => onSelect(index)}
                  className="bg-background rounded-xl p-4 mb-3 border-2 border-gray-800"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-3">
                      <Text className="text-white font-semibold text-lg" numberOfLines={2}>
                        {match.productName}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                        {match.description}
                      </Text>
                    </View>
                    <View className={`items-center px-3 py-2 rounded-lg ${getConfidenceBg(match.confidence)}`}>
                      <Text className={`font-bold text-lg ${getConfidenceColor(match.confidence)}`}>
                        {Math.round(match.confidence * 100)}%
                      </Text>
                      <Text className={`text-xs ${getConfidenceColor(match.confidence)}`}>
                        {getConfidenceLabel(match.confidence)}
                      </Text>
                    </View>
                  </View>

                  {/* Tags */}
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    <View className="bg-gray-700/60 px-3 py-1 rounded-full">
                      <Text className="text-gray-300 text-xs">{match.category}</Text>
                    </View>
                    {match.brand && (
                      <View className="bg-gray-700/60 px-3 py-1 rounded-full">
                        <Text className="text-gray-300 text-xs">{match.brand}</Text>
                      </View>
                    )}
                    <View className="bg-gray-700/60 px-3 py-1 rounded-full">
                      <Text className="text-gray-300 text-xs">{match.condition}</Text>
                    </View>
                  </View>
                </AnimatedButton>
              </MotiView>
            ))}
          </ScrollView>

          {/* Manual Entry Button */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', delay: 500 }}
          >
            <AnimatedButton
              onPress={onManualEntry}
              className="mt-4 border border-gray-600 rounded-xl p-4"
            >
              <Text className="text-gray-400 text-center font-medium">
                ✏️ Keiner passt – manuell eingeben
              </Text>
            </AnimatedButton>
          </MotiView>
        </MotiView>
      </View>
    </Modal>
  );
}
