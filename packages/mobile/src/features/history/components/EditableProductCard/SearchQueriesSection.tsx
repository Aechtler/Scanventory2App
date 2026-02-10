/**
 * SearchQueriesSection - Aufklappbare plattformspezifische Suchbegriffe
 * Collapsed by default, zeigt 4 Felder: eBay, Amazon, Idealo, Generisch
 */

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { EditableField } from './EditableField';
import { SearchQueriesSectionProps } from './types';

const PLATFORMS: { key: keyof SearchQueriesSectionProps['searchQueries']; label: string }[] = [
  { key: 'generic', label: 'Generisch' },
  { key: 'ebay', label: 'eBay' },
  { key: 'amazon', label: 'Amazon' },
  { key: 'idealo', label: 'Idealo' },
];

export function SearchQueriesSection({ searchQueries, onSave }: SearchQueriesSectionProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);

  const handleSaveQuery = (key: string, value: string) => {
    onSave({ ...searchQueries, [key]: value });
  };

  return (
    <View className="mt-3">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between py-2"
      >
        <Text className="text-foreground-secondary text-sm font-medium">Suchbegriffe</Text>
        {expanded ? (
          <Icons.ChevronUp size={16} color={colors.textSecondary} />
        ) : (
          <Icons.ChevronDown size={16} color={colors.textSecondary} />
        )}
      </Pressable>

      <AnimatePresence>
        {expanded && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ type: 'timing', duration: 200 }}
            className="gap-3 pt-1"
          >
            {PLATFORMS.map(({ key, label }) => (
              <EditableField
                key={key}
                label={label}
                value={searchQueries[key] || ''}
                placeholder={`${label}-Suchbegriff...`}
                onSave={(val) => handleSaveQuery(key, val)}
                textClassName="text-foreground text-sm"
              />
            ))}
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
