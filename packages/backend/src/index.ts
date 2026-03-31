/**
 * Server Entry Point
 */

import { config } from './config';
import app from './app';

app.listen(config.port, () => {
  console.log(`Scandirwas API running on port ${config.port}`);
});
