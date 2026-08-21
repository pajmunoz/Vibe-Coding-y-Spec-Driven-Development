import { ShoeType, Repair } from '../domain/types.js';
import { ShoeTypeRepository } from '../repositories/ShoeTypeRepository.js';
import { RepairRepository } from '../repositories/RepairRepository.js';

export interface CatalogService {
  getAllShoeTypes(): ShoeType[];
  getAllRepairs(): Repair[];
}

export class CatalogServiceImpl implements CatalogService {
  private readonly shoeTypeRepository: ShoeTypeRepository;
  private readonly repairRepository: RepairRepository;

  constructor(shoeTypeRepository: ShoeTypeRepository, repairRepository: RepairRepository) {
    this.shoeTypeRepository = shoeTypeRepository;
    this.repairRepository = repairRepository;
  }

  getAllShoeTypes(): ShoeType[] {
    return this.shoeTypeRepository.findAll();
  }

  getAllRepairs(): Repair[] {
    return this.repairRepository.findAll();
  }
}
