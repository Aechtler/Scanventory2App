import { buildItemCollectionPaths } from './itemPathsCollection.ts';
import { buildItemDetailPaths } from './itemPathsDetail.ts';
import { buildItemPriceUpdatePaths } from './itemPathsPriceUpdates.ts';

export function buildItemPaths(): Record<string, unknown> {
  return {
    ...buildItemCollectionPaths(),
    ...buildItemDetailPaths(),
    ...buildItemPriceUpdatePaths(),
  };
}
