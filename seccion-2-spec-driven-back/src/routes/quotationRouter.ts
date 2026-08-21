import { Router, Request, Response } from 'express';
import { QuotationService, DomainError } from '../services/index.js';

export function createQuotationRouter(quotationService: QuotationService): Router {
  const router = Router();

  router.post('/', (req: Request, res: Response) => {
    const { shoeTypeId, repairIds, urgent } = req.body;

    // Validate request body
    const details: string[] = [];

    if (typeof shoeTypeId !== 'string' || shoeTypeId.trim() === '') {
      details.push('shoeTypeId must be a non-empty string');
    }

    if (!Array.isArray(repairIds) || repairIds.length === 0) {
      details.push('repairIds must be a non-empty array');
    }

    if (typeof urgent !== 'boolean') {
      details.push('urgent must be a boolean');
    }

    if (details.length > 0) {
      res.status(400).json({ error: 'Invalid request body', details });
      return;
    }

    try {
      const quotation = quotationService.createQuotation({ shoeTypeId, repairIds, urgent });
      res.status(201).json({ quotation });
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(400).json({ error: error.message, details: [error.code] });
        return;
      }
      throw error;
    }
  });

  return router;
}
