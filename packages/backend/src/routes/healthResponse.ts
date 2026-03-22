import type { ApiResponse } from '../types/index';

export type HealthCheckStatus = 'ok' | 'error';
export type HealthRouteStatus = 'ok' | 'degraded';

export interface HealthDependencyResult {
  status: HealthCheckStatus;
  message?: string;
}

export interface DiskSpaceHealthDependencyResult extends HealthDependencyResult {
  freeBytes: number;
  totalBytes: number;
  minFreeBytes: number;
}

export interface HealthResponseData {
  status: HealthRouteStatus;
  timestamp: string;
  checks: {
    server: HealthDependencyResult;
    database: HealthDependencyResult;
    uploadDir: HealthDependencyResult;
    diskSpace: DiskSpaceHealthDependencyResult;
  };
}

export interface HealthDependencies {
  now?: () => Date;
  checkDatabase: () => Promise<void>;
  checkUploadDirWritable: () => Promise<void>;
  getDiskSpace: () => Promise<{ freeBytes: number; totalBytes: number }>;
  minFreeDiskBytes?: number;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown health-check error';
}

export async function buildHealthResponse(
  dependencies: HealthDependencies
): Promise<ApiResponse<HealthResponseData>> {
  const now = dependencies.now ?? (() => new Date());
  const minFreeDiskBytes = dependencies.minFreeDiskBytes ?? 0;

  const [databaseResult, uploadDirResult, diskSpaceResult] = await Promise.all([
    dependencies.checkDatabase()
      .then<HealthDependencyResult>(() => ({ status: 'ok' }))
      .catch((error: unknown): HealthDependencyResult => ({
        status: 'error',
        message: getErrorMessage(error),
      })),
    dependencies.checkUploadDirWritable()
      .then<HealthDependencyResult>(() => ({ status: 'ok' }))
      .catch((error: unknown): HealthDependencyResult => ({
        status: 'error',
        message: getErrorMessage(error),
      })),
    dependencies.getDiskSpace()
      .then<DiskSpaceHealthDependencyResult>(({ freeBytes, totalBytes }) => {
        if (freeBytes < minFreeDiskBytes) {
          return {
            status: 'error',
            freeBytes,
            totalBytes,
            minFreeBytes: minFreeDiskBytes,
            message: 'Free disk space below configured threshold',
          };
        }

        return {
          status: 'ok',
          freeBytes,
          totalBytes,
          minFreeBytes: minFreeDiskBytes,
        };
      })
      .catch((error: unknown): DiskSpaceHealthDependencyResult => ({
        status: 'error',
        freeBytes: 0,
        totalBytes: 0,
        minFreeBytes: minFreeDiskBytes,
        message: getErrorMessage(error),
      })),
  ]);

  const status: HealthRouteStatus =
    databaseResult.status === 'ok' &&
    uploadDirResult.status === 'ok' &&
    diskSpaceResult.status === 'ok'
      ? 'ok'
      : 'degraded';

  return {
    success: status === 'ok',
    data: {
      status,
      timestamp: now().toISOString(),
      checks: {
        server: { status: 'ok' },
        database: databaseResult,
        uploadDir: uploadDirResult,
        diskSpace: diskSpaceResult,
      },
    },
  };
}
