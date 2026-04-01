import React, { useRef, useState } from 'react';
import { View, Text, useWindowDimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Icons } from '@/shared/components/Icons';

interface ProductFactsCardProps {
  facts: string[];
}

export function ProductFactsCard({ facts }: ProductFactsCardProps) {
  if (!facts || facts.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - 32; // Standard padding (16 on each side)
  
  const scrollViewRef = useRef<ScrollView>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / cardWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <View className="mt-5 mb-2">
      <View className="flex-row items-center gap-2 mb-4 px-4">
        <View className="bg-amber-500/20 p-1.5 rounded-lg">
          <Icons.Sparkles size={16} color="#f59e0b" />
        </View>
        <Text className="text-amber-500 text-xs font-bold uppercase tracking-[2px]">
          Faszinierende Fakten
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="center"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {facts.map((fact, index) => (
          <View 
            key={index} 
            style={{ width: cardWidth - 12, marginRight: 12 }}
          >
            <View className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 min-h-[110px] shadow-xl relative overflow-hidden">
               {/* Decorative background element */}
               <View className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full" />
               
               <View className="flex-row gap-4 items-center">
                  <View className="items-center">
                    <Text className="text-amber-500/20 text-3xl font-black italic">
                      {index + 1}
                    </Text>
                  </View>
                  
                  <Text className="text-zinc-100 text-base font-semibold leading-snug flex-1">
                    {fact}
                  </Text>
               </View>

               <View className="absolute bottom-2 right-4">
                 <Icons.Lightbulb size={16} color="#f59e0b" style={{ opacity: 0.1 }} />
               </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination component */}
      <View className="flex-row justify-center gap-2.5 mt-6">
        {facts.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full ${
              index === currentIndex ? 'w-8 bg-amber-500' : 'w-1.5 bg-zinc-800'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
