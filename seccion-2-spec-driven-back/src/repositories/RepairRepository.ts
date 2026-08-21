import { Repair } from '../domain/types.js';

export interface RepairRepository {
  findAll(): Repair[];
  findById(id: string): Repair | undefined;
  findByIds(ids: string[]): Repair[];
}

export class InMemoryRepairRepository implements RepairRepository {
  private readonly repairs: Repair[];

  constructor() {
    this.repairs = [
      { id: 'r-1', name: 'Cambio de suela', basePrice: 25.00, estimatedDays: 5 },
      { id: 'r-2', name: 'Costura', basePrice: 15.00, estimatedDays: 3 },
      { id: 'r-3', name: 'Limpieza profunda', basePrice: 10.00, estimatedDays: 1 },
      { id: 'r-4', name: 'Cambio de taco', basePrice: 20.00, estimatedDays: 4 },
    ];
  }

  findAll(): Repair[] {
    return [...this.repairs];
  }

  findById(id: string): Repair | undefined {
    return this.repairs.find((r) => r.id === id);
  }

  findByIds(ids: string[]): Repair[] {
    return this.repairs.filter((r) => ids.includes(r.id));
  }
}
