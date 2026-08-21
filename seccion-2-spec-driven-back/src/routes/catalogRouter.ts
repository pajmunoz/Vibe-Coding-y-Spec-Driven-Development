import { Router, Request, Response } from 'express';
import { CatalogService } from '../services/index.js';

export function createCatalogRouter(catalogService: CatalogService): Router {
  const router = Router();

  router.get('/shoe-types', (_req: Request, res: Response) => {
    const shoeTypes = catalogService.getAllShoeTypes();
    res.status(200).json(shoeTypes);
  });

  router.get('/repairs', (_req: Request, res: Response) => {
    const repairs = catalogService.getAllRepairs();
    res.status(200).json(repairs);
  });

  return router;
}
