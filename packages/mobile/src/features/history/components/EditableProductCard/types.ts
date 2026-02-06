/**
 * Types for EditableProductCard and its sub-components
 */

export interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  placeholder?: string;
  textClassName?: string;
  multiline?: boolean;
}

export interface EditableTagProps {
  value: string;
  onSave: (value: string) => void;
  presets?: string[];
}

export interface SearchQueriesSectionProps {
  searchQueries: {
    ebay?: string;
    kleinanzeigen?: string;
    amazon?: string;
    idealo?: string;
    generic?: string;
  };
  onSave: (queries: SearchQueriesSectionProps['searchQueries']) => void;
}

export interface EditableProductCardProps {
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  confidence: number;
  gtin?: string | null;
  searchQueries?: SearchQueriesSectionProps['searchQueries'];
  scannedAt: string;
  onUpdate: (fields: Record<string, unknown>) => void;
}
