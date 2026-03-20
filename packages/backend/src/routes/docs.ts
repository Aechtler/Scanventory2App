import { Router, Request, Response } from 'express';
import { buildOpenApiDocument, buildSwaggerHtml } from './apiDocs';

const router = Router();

router.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(buildOpenApiDocument());
});

router.get('/', (_req: Request, res: Response) => {
  res.type('html').send(buildSwaggerHtml('/api/docs/openapi.json'));
});

export default router;
