import { describe, it, expect } from 'vitest';
import { QuotationServiceImpl, DomainError } from '../services/QuotationService.js';
import { InMemoryShoeTypeRepository } from '../repositories/ShoeTypeRepository.js';
import { InMemoryRepairRepository } from '../repositories/RepairRepository.js';

describe('QuotationServiceImpl', () => {
  const shoeTypeRepo = new InMemoryShoeTypeRepository();
  const repairRepo = new InMemoryRepairRepository();
  const service = new QuotationServiceImpl(shoeTypeRepo, repairRepo);

  describe('validation errors', () => {
    it('throws DomainError with code EMPTY_REPAIRS when repairIds is empty', () => {
      expect(() =>
        service.createQuotation({ shoeTypeId: 'st-1', repairIds: [], urgent: false })
      ).toThrowError(
        expect.objectContaining({
          name: 'DomainError',
          code: 'EMPTY_REPAIRS',
        })
      );
    });

    it('throws DomainError with code SHOE_TYPE_NOT_FOUND for unknown shoeTypeId', () => {
      expect(() =>
        service.createQuotation({ shoeTypeId: 'st-unknown', repairIds: ['r-1'], urgent: false })
      ).toThrowError(
        expect.objectContaining({
          name: 'DomainError',
          code: 'SHOE_TYPE_NOT_FOUND',
        })
      );
    });

    it('throws DomainError with code REPAIRS_NOT_FOUND when some repairIds do not exist', () => {
      try {
        service.createQuotation({ shoeTypeId: 'st-1', repairIds: ['r-1', 'r-999'], urgent: false });
        expect.fail('Expected DomainError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        const domainError = error as DomainError;
        expect(domainError.code).toBe('REPAIRS_NOT_FOUND');
        expect(domainError.message).toContain('r-999');
      }
    });
  });

  describe('pricing calculation (non-urgent)', () => {
    it('calculates correct subtotal, surcharge, total, and estimatedDays for zapatilla + suela + costura', () => {
      // Zapatilla deportiva: complexityFactor = 1.0
      // Cambio de suela: basePrice = 25.00, estimatedDays = 5
      // Costura: basePrice = 15.00, estimatedDays = 3
      // subtotal = (25 * 1.0) + (15 * 1.0) = 40.00
      // surcharge = 0 (not urgent)
      // total = 40.00
      // estimatedDays = max(5, 3) = 5
      const quotation = service.createQuotation({
        shoeTypeId: 'st-1',
        repairIds: ['r-1', 'r-2'],
        urgent: false,
      });

      expect(quotation.subtotal).toBe(40.0);
      expect(quotation.surcharge).toBe(0);
      expect(quotation.total).toBe(40.0);
      expect(quotation.estimatedDays).toBe(5);
      expect(quotation.urgent).toBe(false);
    });
  });

  describe('pricing calculation (urgent)', () => {
    it('applies 30% surcharge and halves estimatedDays for zapatilla + suela + costura', () => {
      // Same as above but urgent = true
      // subtotal = 40.00
      // surcharge = 40.00 * 0.30 = 12.00
      // total = 40.00 + 12.00 = 52.00
      // estimatedDays = max(1, ceil(5 / 2)) = max(1, 3) = 3
      const quotation = service.createQuotation({
        shoeTypeId: 'st-1',
        repairIds: ['r-1', 'r-2'],
        urgent: true,
      });

      expect(quotation.subtotal).toBe(40.0);
      expect(quotation.surcharge).toBe(12.0);
      expect(quotation.total).toBe(52.0);
      expect(quotation.estimatedDays).toBe(3);
      expect(quotation.urgent).toBe(true);
    });

    it('enforces minimum estimatedDays of 1 for single repair with 1 day (limpieza urgent)', () => {
      // Limpieza profunda: basePrice = 10.00, estimatedDays = 1
      // Zapatilla: complexityFactor = 1.0
      // estimatedDays = max(1, ceil(1 / 2)) = max(1, 1) = 1
      const quotation = service.createQuotation({
        shoeTypeId: 'st-1',
        repairIds: ['r-3'],
        urgent: true,
      });

      expect(quotation.estimatedDays).toBe(1);
    });
  });

  describe('quotation structure', () => {
    it('returns a quotation with all required fields', () => {
      const quotation = service.createQuotation({
        shoeTypeId: 'st-1',
        repairIds: ['r-1'],
        urgent: false,
      });

      expect(quotation.id).toBeDefined();
      expect(typeof quotation.id).toBe('string');
      expect(quotation.createdAt).toBeDefined();
      expect(quotation.shoeTypeId).toBe('st-1');
      expect(quotation.repairIds).toEqual(['r-1']);
      expect(typeof quotation.subtotal).toBe('number');
      expect(typeof quotation.surcharge).toBe('number');
      expect(typeof quotation.total).toBe('number');
      expect(typeof quotation.estimatedDays).toBe('number');
      expect(typeof quotation.urgent).toBe('boolean');
    });
  });
});
