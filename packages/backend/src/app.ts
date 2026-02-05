/**
 * Express App Setup - Middleware und Routes
 */

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Error Handler (muss zuletzt registriert werden)
app.use(errorHandler);

export default app;
