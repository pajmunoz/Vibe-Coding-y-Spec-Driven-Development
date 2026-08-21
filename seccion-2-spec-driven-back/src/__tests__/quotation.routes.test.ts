import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import { startTestServer, TestServer } from './helpers/testServer.js';

describe('POST /quotations', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer(app);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('validation errors (400)', () => {
    it('returns 400 when repairIds is an empty array', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoeTypeId: 'st-1', repairIds: [], urgent: false }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });

    it('returns 400 when shoeTypeId is missing', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairIds: ['r-1'], urgent: false }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.details).toContain('shoeTypeId must be a non-empty string');
    });

    it('returns 400 when body has invalid JSON', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }',
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when urgent is missing', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoeTypeId: 'st-1', repairIds: ['r-1'] }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.details).toContain('urgent must be a boolean');
    });
  });

  describe('successful quotation (201)', () => {
    it('returns 201 with a quotation object containing all fields', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoeTypeId: 'st-1', repairIds: ['r-1'], urgent: false }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('quotation');

      const { quotation } = body;
      expect(quotation).toHaveProperty('id');
      expect(quotation).toHaveProperty('createdAt');
      expect(quotation.shoeTypeId).toBe('st-1');
      expect(quotation.repairIds).toEqual(['r-1']);
      expect(quotation.subtotal).toBe(25.0);
      expect(quotation.surcharge).toBe(0);
      expect(quotation.total).toBe(25.0);
      expect(quotation.estimatedDays).toBe(5);
      expect(quotation.urgent).toBe(false);
    });

    it('returns 201 with surcharge applied when urgent is true', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoeTypeId: 'st-1', repairIds: ['r-1'], urgent: true }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      const { quotation } = body;

      expect(quotation.subtotal).toBe(25.0);
      expect(quotation.surcharge).toBe(7.5);
      expect(quotation.total).toBe(32.5);
      expect(quotation.estimatedDays).toBe(3);
      expect(quotation.urgent).toBe(true);
    });
  });

  describe('domain errors (400)', () => {
    it('returns 400 with SHOE_TYPE_NOT_FOUND for unknown shoeTypeId', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoeTypeId: 'st-unknown', repairIds: ['r-1'], urgent: false }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.details).toContain('SHOE_TYPE_NOT_FOUND');
    });

    it('returns 400 with REPAIRS_NOT_FOUND for unknown repairIds', async () => {
      const response = await fetch(`${server.url}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoeTypeId: 'st-1', repairIds: ['r-999'], urgent: false }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.details).toContain('REPAIRS_NOT_FOUND');
    });
  });
});
