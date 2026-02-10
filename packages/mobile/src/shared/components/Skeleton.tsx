/**
 * Skeleton Loading Components
 * Premium shimmer effect für Loading States
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

/**
 * Animierter Skeleton mit Shimmer-Effekt
 */
export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
      style={[
        styles.skeleton,
        {
          width: typeof width === 'number' ? width : undefined,
          height,
          borderRadius,
        },
      ]}
      className={`bg-background-elevated ${className}`}
    />
  );
}

/**
 * Skeleton für Bildvorschau
 */
export function ImageSkeleton({ aspectRatio = 4/3 }: { aspectRatio?: number }) {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
      className="bg-background-elevated rounded-2xl w-full"
      style={{ aspectRatio }}
    />
  );
}

/**
 * Skeleton für einen History-Eintrag
 */
export function HistoryItemSkeleton() {
  return (
    <View className="bg-background-card rounded-xl p-4 mb-3 flex-row">
      {/* Thumbnail Skeleton */}
      <MotiView
        from={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 1000, loop: true }}
        className="w-20 h-20 rounded-lg bg-background-elevated"
      />
      
      {/* Content Skeleton */}
      <View className="flex-1 ml-4 justify-center">
        <Skeleton width="80%" height={18} />
        <View className="flex-row gap-2 mt-2">
          <Skeleton width={60} height={20} borderRadius={4} />
          <Skeleton width={50} height={20} borderRadius={4} />
        </View>
        <View className="flex-row justify-between mt-3">
          <Skeleton width={80} height={16} />
          <Skeleton width={100} height={12} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton für Analyse-Ergebnis
 */
export function AnalysisResultSkeleton() {
  return (
    <View className="bg-background-card rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <Skeleton width="70%" height={24} />
        <Skeleton width={50} height={24} borderRadius={4} />
      </View>
      
      <View className="flex-row gap-2 mb-3">
        <Skeleton width={80} height={26} borderRadius={16} />
        <Skeleton width={60} height={26} borderRadius={16} />
        <Skeleton width={70} height={26} borderRadius={16} />
      </View>
      
      <Skeleton height={40} />
    </View>
  );
}

/**
 * Skeleton für Preisstatistiken
 */
export function PriceStatsSkeleton() {
  return (
    <View className="bg-background-card rounded-xl p-4 mb-4">
      <Skeleton width={180} height={22} className="mb-4" />
      
      {/* Hauptpreis */}
      <View className="bg-background rounded-xl p-4 mb-4 items-center">
        <Skeleton width={120} height={14} className="mb-2" />
        <Skeleton width={160} height={36} className="mb-2" />
        <Skeleton width={140} height={14} />
      </View>
      
      {/* Stats Grid */}
      <View className="flex-row gap-3">
        {[1, 2, 3].map((i) => (
          <View key={i} className="flex-1 bg-background rounded-lg p-3 items-center">
            <Skeleton width={40} height={28} className="mb-1" />
            <Skeleton width={50} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
