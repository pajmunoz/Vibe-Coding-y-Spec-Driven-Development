import { ShoeType } from '../domain/types.js';

export interface ShoeTypeRepository {
  findAll(): ShoeType[];
  findById(id: string): ShoeType | undefined;
}

export class InMemoryShoeTypeRepository implements ShoeTypeRepository {
  private readonly shoeTypes: ShoeType[];

  constructor() {
    this.shoeTypes = [
      { id: 'st-1', name: 'Zapatilla deportiva', complexityFactor: 1.0 },
      { id: 'st-2', name: 'Bota', complexityFactor: 1.5 },
      { id: 'st-3', name: 'Sandalia', complexityFactor: 0.8 },
    ];
  }

  findAll(): ShoeType[] {
    return [...this.shoeTypes];
  }

  findById(id: string): ShoeType | undefined {
    return this.shoeTypes.find((st) => st.id === id);
  }
}
