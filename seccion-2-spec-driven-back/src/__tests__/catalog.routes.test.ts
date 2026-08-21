import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import { startTestServer, TestServer } from './helpers/testServer.js';

describe('GET /catalog', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer(app);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /catalog/shoe-types', () => {
    it('returns 200 with a non-empty array of at least 3 shoe types', async () => {
      const response = await fetch(`${server.url}/catalog/shoe-types`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(3);
    });

    it('each shoe type has id, name, and complexityFactor', async () => {
      const response = await fetch(`${server.url}/catalog/shoe-types`);
      const body = await response.json();

      for (const shoeType of body) {
        expect(shoeType).toHaveProperty('id');
        expect(shoeType).toHaveProperty('name');
        expect(shoeType).toHaveProperty('complexityFactor');
        expect(typeof shoeType.id).toBe('string');
        expect(typeof shoeType.name).toBe('string');
        expect(typeof shoeType.complexityFactor).toBe('number');
      }
    });
  });

  describe('GET /catalog/repairs', () => {
    it('returns 200 with a non-empty array of at least 4 repairs', async () => {
      const response = await fetch(`${server.url}/catalog/repairs`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(4);
    });

    it('each repair has id, name, basePrice, and estimatedDays', async () => {
      const response = await fetch(`${server.url}/catalog/repairs`);
      const body = await response.json();

      for (const repair of body) {
        expect(repair).toHaveProperty('id');
        expect(repair).toHaveProperty('name');
        expect(repair).toHaveProperty('basePrice');
        expect(repair).toHaveProperty('estimatedDays');
        expect(typeof repair.id).toBe('string');
        expect(typeof repair.name).toBe('string');
        expect(typeof repair.basePrice).toBe('number');
        expect(typeof repair.estimatedDays).toBe('number');
      }
    });
  });
});
