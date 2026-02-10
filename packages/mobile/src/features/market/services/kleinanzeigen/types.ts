/**
 * Kleinanzeigen Service Types
 */

export interface KleinanzeigenConfig {
  apiUrl: string;
  timeout: number;
}

export const KLEINANZEIGEN_CONFIG: KleinanzeigenConfig = {
  apiUrl: 'https://api.kleinanzeigen.de',
  timeout: 8000,
};
