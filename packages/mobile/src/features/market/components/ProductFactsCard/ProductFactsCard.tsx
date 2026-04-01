/**
 * ProductFactsCard - Zeigt 5 interessante Fakten zum Produkt
 */

import { View, Text } from 'react-native';
import { Icons } from '@/shared/components/Icons';

interface ProductFactsCardProps {
  facts: string[];
}

export function ProductFactsCard({ facts }: ProductFactsCardProps) {
  if (!facts || facts.length === 0) return null;

  return (
    <View className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 mt-3">
      <View className="flex-row items-center gap-2 mb-3">
        <Icons.Sparkles size={15} color="#f59e0b" />
        <Text className="text-amber-400 text-xs font-semibold uppercase tracking-wide">
          Wusstest du schon?
        </Text>
      </View>
      {facts.map((fact, index) => (
        <View key={index} className="flex-row gap-2.5 mb-2.5 last:mb-0">
          <Text className="text-amber-400/70 text-xs font-bold mt-0.5">{index + 1}.</Text>
          <Text className="text-foreground-secondary text-xs flex-1 leading-5">{fact}</Text>
        </View>
      ))}
    </View>
  );
}
