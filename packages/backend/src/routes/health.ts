/**
 * Health Check Route - Kein Auth erforderlich
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Router, Request, Response } from 'express';
import { config } from '../config';
import { prisma } from '../services/itemService';
import { buildHealthResponse } from './healthResponse';

const router = Router();

function getMinFreeDiskBytes(): number {
  const rawValue = process.env.HEALTH_MIN_FREE_DISK_BYTES;
  if (!rawValue) {
    return 10 * 1024 * 1024;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : 10 * 1024 * 1024;
}

async function ensureUploadDir(): Promise<string> {
  const uploadDir = path.resolve(config.uploadDir);
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

async function checkUploadDirWritable(): Promise<void> {
  const uploadDir = await ensureUploadDir();
  const probeFile = path.join(uploadDir, `.healthcheck-${randomUUID()}.tmp`);

  await fs.writeFile(probeFile, 'ok');
  await fs.unlink(probeFile);
}

async function getDiskSpace() {
  const uploadDir = await ensureUploadDir();
  const stats = await fs.statfs(uploadDir);

  return {
    freeBytes: stats.bavail * stats.bsize,
    totalBytes: stats.blocks * stats.bsize,
  };
}

router.get('/', async (_req: Request, res: Response) => {
  const response = await buildHealthResponse({
    checkDatabase: async () => {
      await prisma.$queryRawUnsafe('SELECT 1');
    },
    checkUploadDirWritable,
    getDiskSpace,
    minFreeDiskBytes: getMinFreeDiskBytes(),
  });

  res.status(response.success ? 200 : 503).json(response);
});

export default router;
