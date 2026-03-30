/**
 * Express App Setup - Middleware und Routes
 */

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { enforceHttpsMiddleware } from './middleware/https';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLoggingMiddleware } from './middleware/requestLogging';

const app = express();

app.set('trust proxy', true);

// Middleware
app.use(enforceHttpsMiddleware);
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
}));
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggingMiddleware);

// API Routes
app.use('/api', apiRoutes);

// Error Handler (muss zuletzt registriert werden)
app.use(errorHandler);

export default app;
