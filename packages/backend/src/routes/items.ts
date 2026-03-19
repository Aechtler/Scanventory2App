/**
 * Items Routes - CRUD fuer ScannedItems
 */

import { Router } from 'express';
import { createItem, uploadItemImage } from './items/create';
import { deleteItemById } from './items/delete';
import { getItem, listItems } from './items/read';
import {
  updateItem,
  updateItemMarketValue,
  updateItemPrices,
  updateKleinanzeigenItemPrices,
} from './items/update';

const router = Router();

router.get('/', listItems);
router.get('/:id', getItem);
router.post('/', uploadItemImage.single('image'), createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItemById);
router.patch('/:id/prices', updateItemPrices);
router.patch('/:id/kleinanzeigen-prices', updateKleinanzeigenItemPrices);
router.patch('/:id/market-value', updateItemMarketValue);

export default router;
