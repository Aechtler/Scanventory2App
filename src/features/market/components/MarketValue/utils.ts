/**
 * Market Value Utilities
 */

import { ConfidenceLevel, ConfidenceColors } from './types';

export const confidenceColors: Record<ConfidenceLevel, ConfidenceColors> = {
  hoch: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  mittel: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  niedrig: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
};
