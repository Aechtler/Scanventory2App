/**
 * SwipeableLibraryItem - Wischbare Bibliotheks-Zeile mit Löschen-Aktion
 */

import React, { useRef } from 'react';
import { View, Alert, Animated, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Icons } from '@/shared/components/Icons';

interface SwipeableLibraryItemProps {
  itemName: string;
  onDelete: () => void;
  children: React.ReactNode;
}

function renderRightActions(
  _progress: Animated.AnimatedInterpolation<number>,
  dragX: Animated.AnimatedInterpolation<number>,
) {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });
  const opacity = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.actionContainer}>
      <Animated.View style={[styles.deleteButton, { transform: [{ scale }], opacity }]}>
        <Icons.Close size={26} color="#ef4444" />
      </Animated.View>
    </View>
  );
}

export function SwipeableLibraryItem({
  itemName,
  onDelete,
  children,
}: SwipeableLibraryItemProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleSwipeOpen = () => {
    Alert.alert(
      'Löschen?',
      `${itemName} wirklich löschen?`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: onDelete,
        },
      ],
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
      overshootRight={false}
      rightThreshold={70}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    width: 88,
  },
  deleteButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
});
