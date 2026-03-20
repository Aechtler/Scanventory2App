/**
 * Route-Aggregator - Registriert alle API-Routen
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { jwtAuthMiddleware } from '../middleware/jwtAuth';
import healthRouter from './health';
import itemsRouter from './items';
import imagesRouter from './images';
import authRouter from './auth';
import docsRouter from './docs';

const router = Router();

// Oeffentliche Routen (kein Auth)
router.use('/health', healthRouter);
router.use('/images', imagesRouter);
router.use('/auth', authRouter);
router.use('/docs', docsRouter);

// Geschuetzte Routen (JWT Auth erforderlich)
router.use('/items', jwtAuthMiddleware, itemsRouter);

export default router;
