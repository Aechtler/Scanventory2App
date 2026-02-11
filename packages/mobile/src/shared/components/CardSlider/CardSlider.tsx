/**
 * CardSlider - Horizontaler paginated ScrollView
 * Wiederverwendbare Komponente fuer seitenweise Navigation
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { PageIndicator } from './PageIndicator';
import { CardSliderProps } from './types';

const HORIZONTAL_PADDING = 16;

export function CardSlider({
  children,
  onPageChange,
  showIndicator = true,
}: CardSliderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const scrollViewRef = useRef<ScrollView>(null);
  const currentPageRef = useRef(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / slideWidth);
      if (page !== currentPageRef.current) {
        currentPageRef.current = page;
        setCurrentPage(page);
        onPageChange?.(page);
      }
    },
    [slideWidth, onPageChange]
  );

  const childArray = React.Children.toArray(children);

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        snapToInterval={slideWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {childArray.map((child, index) => (
          <View key={index} style={{ width: slideWidth }}>
            {child}
          </View>
        ))}
      </ScrollView>

      {showIndicator && (
        <PageIndicator total={childArray.length} current={currentPage} />
      )}
    </View>
  );
}
