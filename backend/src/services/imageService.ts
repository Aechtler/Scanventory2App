/**
 * Image Service - Bild-Speicherung und -Verwaltung
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

function ensureUploadDir(): void {
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }
}

/** Speichert eine hochgeladene Datei und gibt den Dateinamen zurueck */
export function saveImage(file: Express.Multer.File): string {
  ensureUploadDir();
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${uuidv4()}${ext}`;
  const destPath = path.join(config.uploadDir, filename);
  fs.renameSync(file.path, destPath);
  return filename;
}

/** Gibt den absoluten Pfad zu einem Bild zurueck */
export function getImagePath(filename: string): string {
  return path.join(config.uploadDir, filename);
}

/** Prueft ob ein Bild existiert */
export function imageExists(filename: string): boolean {
  return fs.existsSync(getImagePath(filename));
}

/** Loescht ein Bild vom Filesystem */
export function deleteImage(filename: string): void {
  const filePath = getImagePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
