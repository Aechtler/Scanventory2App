import type { ReactNode } from 'react';

interface KeyedReactNode {
  key?: string | number | null;
}

function hasOwnKey(child: ReactNode): child is ReactNode & KeyedReactNode {
  return typeof child === 'object' && child !== null && 'key' in child;
}

export function getCardSliderItemKey(child: ReactNode): string {
  if (hasOwnKey(child) && child.key != null) {
    return String(child.key);
  }

  return `card-slider-item:${typeof child}:${String(child)}`;
}
