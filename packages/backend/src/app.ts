/**
 * Express App Setup - Middleware und Routes
 */

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { enforceHttpsMiddleware } from './middleware/https';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// Middleware
app.use(enforceHttpsMiddleware);
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
}));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Error Handler (muss zuletzt registriert werden)
app.use(errorHandler);

export default app;
