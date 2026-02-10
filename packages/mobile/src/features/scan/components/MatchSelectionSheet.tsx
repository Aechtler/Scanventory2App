import React from 'react';
import { View, Text, Pressable, ScrollView, Modal, Image } from 'react-native';
import { MotiView } from 'moti';
import { VisionMatch } from '@/features/scan/services/visionService';
import { Icons } from '@/shared/components/Icons';
import { TextInput } from 'react-native';
import { AnimatedButton } from '@/shared/components/Animated';
import { useThemeColors } from '@/shared/hooks';

interface MatchSelectionSheetProps {
  visible: boolean;
  matches: VisionMatch[];
  onSelect: (index: number) => void;
  onManualSearch: (query: string) => void;
}

/**
 * Premium Bottom Sheet mit Animationen für Produktauswahl
 */
export function MatchSelectionSheet({
  visible,
  matches,
  onSelect,
  onManualSearch,
}: MatchSelectionSheetProps) {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = React.useState('');
  const hasMatches = matches.length > 0;
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
            className="self-center h-1 bg-foreground-secondary/30 rounded-full mb-5"
          />

          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 100 }}
            className="items-center mb-5"
          >
            <Text className="text-foreground text-2xl font-bold">
              {hasMatches ? '🔍 Was ist das?' : '🔎 Produkt suchen'}
            </Text>
            <Text className="text-foreground-secondary mt-2 text-center">
              {hasMatches 
                ? 'Wähle die beste Übereinstimmung aus oder suche manuell' 
                : 'Wir konnten das Produkt nicht eindeutig erkennen. Suche manuell:'}
            </Text>
          </MotiView>

          {/* Search Input */}
          <View className="mb-6 px-1">
            <View className="flex-row items-center bg-background rounded-xl border border-border px-4 py-2">
              <Icons.Search size={20} color={colors.textSecondary} />
              <TextInput
                className="flex-1 ml-3 text-foreground text-base py-2"
                placeholder="Marke, Modell, Details..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => searchQuery.trim() && onManualSearch(searchQuery)}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Icons.Close size={20} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
            <AnimatedButton
              onPress={() => searchQuery.trim() && onManualSearch(searchQuery)}
              className="mt-3 bg-primary-500 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">Suchen</Text>
            </AnimatedButton>
          </View>

          {/* Matches Liste mit Stagger */}
          <Text className="text-foreground-secondary text-xs font-bold uppercase mb-3 px-1">
            {hasMatches ? 'KI-Vorschläge' : ''}
          </Text>

          {/* Matches Liste mit Stagger */}
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            {matches.map((match, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 200,
                    delay: 200 + index * 50,
                  }}
              >
                <AnimatedButton
                  onPress={() => onSelect(index)}
                  className="bg-background rounded-xl p-4 mb-3 border-2 border-border"
                >
                  <View className="flex-row items-start gap-3">
                    {/* Product Image */}
                    {match.imageUrl ? (
                      <Image
                        source={{ uri: match.imageUrl }}
                        className="w-20 h-20 rounded-lg bg-background-elevated"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-20 h-20 rounded-lg bg-background-elevated items-center justify-center">
                        <Icons.Package size={32} color={colors.textSecondary} />
                      </View>
                    )}

                    {/* Product Info */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-foreground font-semibold text-base flex-1" numberOfLines={2}>
                          {match.productName}
                        </Text>
                        <View className={`items-center px-2 py-1 rounded-lg ml-2 ${getConfidenceBg(match.confidence)}`}>
                          <Text className={`font-bold text-sm ${getConfidenceColor(match.confidence)}`}>
                            {Math.round(match.confidence * 100)}%
                          </Text>
                        </View>
                      </View>
                      <Text className="text-foreground-secondary text-xs" numberOfLines={2}>
                        {match.description}
                      </Text>
                    </View>
                  </View>

                  {/* Tags */}
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    <View className="bg-background-elevated/60 px-3 py-1 rounded-full">
                      <Text className="text-foreground-secondary text-xs">{match.category}</Text>
                    </View>
                    {match.brand && (
                      <View className="bg-background-elevated/60 px-3 py-1 rounded-full">
                        <Text className="text-foreground-secondary text-xs">{match.brand}</Text>
                      </View>
                    )}
                    <View className="bg-background-elevated/60 px-3 py-1 rounded-full">
                      <Text className="text-foreground-secondary text-xs">{match.condition}</Text>
                    </View>
                  </View>
                </AnimatedButton>
              </MotiView>
            ))}
          </ScrollView>

        </MotiView>
      </View>
    </Modal>
  );
}
