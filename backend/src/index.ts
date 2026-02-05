/**
 * Server Entry Point
 */

import { config } from './config';
import app from './app';

app.listen(config.port, () => {
  console.log(`ScanApp API running on port ${config.port}`);
});
