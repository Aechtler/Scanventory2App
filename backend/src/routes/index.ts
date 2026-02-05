/**
 * Route-Aggregator - Registriert alle API-Routen
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import healthRouter from './health';
import itemsRouter from './items';
import imagesRouter from './images';

const router = Router();

// Oeffentliche Routen (kein Auth)
router.use('/health', healthRouter);
router.use('/images', imagesRouter);

// Geschuetzte Routen (Auth erforderlich)
router.use('/items', authMiddleware, itemsRouter);

export default router;
