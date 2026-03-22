/**
 * Route-Aggregator - Registriert alle API-Routen
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { jwtAuthMiddleware } from '../middleware/jwtAuth';
import healthRouter from './health';
import itemsRouter from './items';
import authRouter from './auth';
import docsRouter from './docs';
import usersRouter from './users';
import followsRouter from './follows';
import groupsRouter from './groups';
import itemSharingRouter, { sharedWithMeRouter, groupLibraryRouter } from './sharing';

const router = Router();

// Oeffentliche Routen (kein Auth)
router.use('/health', healthRouter);
// /images Route entfernt: Bilder werden direkt über Supabase Storage CDN URLs ausgeliefert
router.use('/auth', authRouter);
router.use('/docs', docsRouter);

// User-Profile (optional Auth) + Follow-Routen (Auth innerhalb der Handler)
router.use('/users', usersRouter);
router.use('/users', followsRouter);

// Gruppen (inkl. Gruppen-Library)
router.use('/groups', groupsRouter);
router.use('/groups', groupLibraryRouter);

// Shared-Items Endpoint
router.use('/shared', sharedWithMeRouter);

// Geschuetzte Routen (JWT Auth erforderlich)
router.use('/items', jwtAuthMiddleware, itemsRouter);
// Item-Sharing (Auth innerhalb der Handler)
router.use('/items', itemSharingRouter);

export default router;
