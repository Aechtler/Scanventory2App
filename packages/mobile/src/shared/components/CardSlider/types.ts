/**
 * CardSlider Types
 */

import { ReactNode } from 'react';

export interface CardSliderProps {
  children: ReactNode[];
  /** Callback when page changes */
  onPageChange?: (index: number) => void;
  /** Show page indicator dots */
  showIndicator?: boolean;
}

export interface PageIndicatorProps {
  total: number;
  current: number;
}
