import { buildItemCollectionPaths } from './itemPathsCollection';
import { buildItemDetailPaths } from './itemPathsDetail';
import { buildItemPriceUpdatePaths } from './itemPathsPriceUpdates';

export function buildItemPaths(): Record<string, unknown> {
  return {
    ...buildItemCollectionPaths(),
    ...buildItemDetailPaths(),
    ...buildItemPriceUpdatePaths(),
  };
}
