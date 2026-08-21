import { randomUUID } from 'node:crypto';
import { Quotation, QuotationRequest } from '../domain/types.js';
import { ShoeTypeRepository } from '../repositories/ShoeTypeRepository.js';
import { RepairRepository } from '../repositories/RepairRepository.js';

export type DomainErrorCode = 'EMPTY_REPAIRS' | 'SHOE_TYPE_NOT_FOUND' | 'REPAIRS_NOT_FOUND';

export class DomainError extends Error {
  public readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

export interface QuotationService {
  createQuotation(request: QuotationRequest): Quotation;
}

export class QuotationServiceImpl implements QuotationService {
  private readonly shoeTypeRepository: ShoeTypeRepository;
  private readonly repairRepository: RepairRepository;

  constructor(shoeTypeRepository: ShoeTypeRepository, repairRepository: RepairRepository) {
    this.shoeTypeRepository = shoeTypeRepository;
    this.repairRepository = repairRepository;
  }

  createQuotation(request: QuotationRequest): Quotation {
    const { shoeTypeId, repairIds, urgent } = request;

    // Validation: repairIds must not be empty
    if (!repairIds || repairIds.length === 0) {
      throw new DomainError('EMPTY_REPAIRS', 'repairIds must not be empty');
    }

    // Validation: shoeTypeId must exist
    const shoeType = this.shoeTypeRepository.findById(shoeTypeId);
    if (!shoeType) {
      throw new DomainError('SHOE_TYPE_NOT_FOUND', `Shoe type "${shoeTypeId}" not found`);
    }

    // Validation: all repairIds must exist
    const repairs = this.repairRepository.findByIds(repairIds);
    const foundIds = new Set(repairs.map((r) => r.id));
    const missingIds = repairIds.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      throw new DomainError('REPAIRS_NOT_FOUND', `Repairs not found: ${missingIds.join(', ')}`);
    }

    // Pricing
    const subtotal = Math.round(
      repairs.reduce((sum, repair) => sum + repair.basePrice * shoeType.complexityFactor, 0) * 100
    ) / 100;

    const surcharge = urgent ? Math.round(subtotal * 0.30 * 100) / 100 : 0;

    const total = Math.round((subtotal + surcharge) * 100) / 100;

    // Estimated days
    const maxDays = Math.max(...repairs.map((r) => r.estimatedDays));
    const estimatedDays = urgent ? Math.max(1, Math.ceil(maxDays / 2)) : maxDays;

    return {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      shoeTypeId,
      repairIds,
      subtotal,
      surcharge,
      total,
      estimatedDays,
      urgent,
    };
  }
}
