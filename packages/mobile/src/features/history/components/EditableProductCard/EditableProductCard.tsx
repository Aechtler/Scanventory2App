/**
 * EditableProductCard - Ersetzt die statische Produkt-Karte
 * Alle Felder inline editierbar: Produktname, Tags, GTIN, Suchbegriffe
 */

import React from 'react';
import { View, Text } from 'react-native';
import { StaggeredItem } from '@/shared/components/Animated';
import { EditableField } from './EditableField';
import { EditableTag } from './EditableTag';
import { SearchQueriesSection } from './SearchQueriesSection';
import { EditableProductCardProps } from './types';
import { isManualSearchResult } from '@/shared/utils/analysisSource';

const CONDITION_PRESETS = ['Neu', 'Wie neu', 'Gut', 'Akzeptabel', 'Defekt'];

export function EditableProductCard({
  productName,
  category,
  brand,
  condition,
  confidence,
  gtin,
  searchQueries,
  scannedAt,
  onUpdate,
}: EditableProductCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View className="bg-background-card rounded-xl p-4 mb-4 border border-border">
      {/* Produktname + Confidence */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <EditableField
            value={productName}
            onSave={(val) => onUpdate({ productName: val })}
            textClassName="text-foreground text-xl font-bold"
          />
        </View>
        <View className="bg-primary-500/20 px-3 py-1 rounded-lg">
          <Text className="text-primary-400 font-bold">
            {isManualSearchResult({ category }) ? 'Manuelle Suche' : `${Math.round(confidence * 100)}%`}
          </Text>
        </View>
      </View>

      {/* GTIN */}
      <View className="mb-3">
        <EditableField
          value={gtin || ''}
          onSave={(val) => onUpdate({ gtin: val || null })}
          label="Artikelnummer"
          placeholder="EAN / GTIN eingeben..."
          textClassName="text-foreground-secondary text-xs font-mono"
        />
      </View>

      {/* Tags: Category, Brand, Condition */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        <StaggeredItem index={0}>
          <EditableTag
            value={category}
            onSave={(val) => onUpdate({ category: val })}
          />
        </StaggeredItem>
        {brand && (
          <StaggeredItem index={1}>
            <EditableTag
              value={brand}
              onSave={(val) => onUpdate({ brand: val })}
            />
          </StaggeredItem>
        )}
        <StaggeredItem index={2}>
          <EditableTag
            value={condition}
            onSave={(val) => onUpdate({ condition: val })}
            presets={CONDITION_PRESETS}
          />
        </StaggeredItem>
      </View>

      {/* Suchbegriffe (aufklappbar) */}
      <SearchQueriesSection
        searchQueries={searchQueries || {}}
        onSave={(queries) => onUpdate({ searchQueries: queries })}
      />

      {/* Datum */}
      <Text className="text-foreground-secondary text-sm mt-3">
        Gescannt: {formatDate(scannedAt)}
      </Text>
    </View>
  );
}
