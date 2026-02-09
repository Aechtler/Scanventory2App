/**
 * HistoryDetailHeader Component
 * 
 * Hero section with image, gradient overlay, and product info
 */

import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { FadeInView } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';
import { HistoryItem } from '@/features/history/store/historyStore';

interface HistoryDetailHeaderProps {
  item: HistoryItem;
}

export function HistoryDetailHeader({ item }: HistoryDetailHeaderProps) {
  return (
    <FadeInView delay={0}>
      <Pressable onPress={() => router.push(`/history/edit/${item.id}`)}>
        <MotiView
          from={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="rounded-2xl overflow-hidden mb-6 relative"
        >
          <Image
            source={{ uri: item.cachedImageUri || item.imageUri }}
            style={{ width: '100%', aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay von unten */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(17,24,39,0.95)', '#111827']}
            locations={[0, 0.4, 0.75, 1]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '70%',
            }}
          />
          
          {/* Produktinfos über dem Gradient */}
          <View className="absolute bottom-0 left-0 right-0 p-4">
            {/* Produktname */}
            <Text className="text-white text-2xl font-bold mb-2" numberOfLines={2}>
              {item.productName}
            </Text>
            
            {/* Tags: Category, Brand, Condition */}
            <View className="flex-row flex-wrap gap-2 mb-2">
              <View className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Text className="text-white/90 text-sm">{item.category}</Text>
              </View>
              {item.brand && (
                <View className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Text className="text-white/90 text-sm">{item.brand}</Text>
                </View>
              )}
              <View className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Text className="text-white/90 text-sm">{item.condition}</Text>
              </View>
              {/* Confidence Badge */}
              <View className="bg-primary-500/30 px-3 py-1.5 rounded-full">
                <Text className="text-primary-300 text-sm font-semibold">
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            </View>
            
            {/* GTIN wenn vorhanden */}
            {item.gtin && (
              <Text className="text-white/50 text-xs font-mono">
                {item.gtin}
              </Text>
            )}
          </View>

          {/* Edit-Hint Overlay oben rechts */}
          <View className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full flex-row items-center gap-2">
            <Icons.Pencil size={14} color="#ffffff" />
            <Text className="text-white text-xs font-medium">Bearbeiten</Text>
          </View>
        </MotiView>
      </Pressable>
    </FadeInView>
  );
}
