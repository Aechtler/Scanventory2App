// History Feature - Public API

// Types
export type {
  HistoryEntry,
  HistorySortBy,
  HistorySortOrder,
  HistoryFilters,
} from './types/history.types';

// Store
export { useHistoryStore } from './store/historyStore';
export type { HistoryItem, HistoryItemDraft, HistoryItemUpdateFields } from './store/historyStore';

// Hooks
export { useFollowingItems } from './hooks/useFollowingItems';
export type { FollowingItem } from './hooks/useFollowingItems';

// Services
export {
  syncNewItem,
  syncItemUpdate,
  syncDeleteItem,
  syncPrices,
  syncMarketValue,
} from './services/syncService';
export { generateCSV, exportAndShareCSV, calculateTotalValue } from './services/exportService';

// Components
export { EditableProductCard } from './components/EditableProductCard';
export { FinalPriceCard } from './components/FinalPriceCard';
export { PriceEditSheet } from './components/PriceEditSheet';
export { HistoryDetailHeader } from './components/HistoryDetailHeader';
export { HistoryDetailHeaderActions } from './components/HistoryDetailHeaderActions';
export { HistoryDetailMarketSection } from './components/HistoryDetailMarketSection';
export { HistoryDetailNotFound } from './components/HistoryDetailNotFound';

// Utils (cross-feature)
export { getLibraryDisplayPrice, hasLibraryDisplayPrice } from './utils/historyPricing';
export { classifyProduct } from './utils/productClassification';
