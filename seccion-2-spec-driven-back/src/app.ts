import express from 'express';
import cors from 'cors';
import { InMemoryShoeTypeRepository, InMemoryRepairRepository } from './repositories/index.js';
import { CatalogServiceImpl, QuotationServiceImpl } from './services/index.js';
import { createCatalogRouter, createQuotationRouter } from './routes/index.js';

// Repositories
const shoeTypeRepository = new InMemoryShoeTypeRepository();
const repairRepository = new InMemoryRepairRepository();

// Services
const catalogService = new CatalogServiceImpl(shoeTypeRepository, repairRepository);
const quotationService = new QuotationServiceImpl(shoeTypeRepository, repairRepository);

// Routers
const catalogRouter = createCatalogRouter(catalogService);
const quotationRouter = createQuotationRouter(quotationService);

// App
const app = express();

app.use(express.json());
app.use(cors());

app.use('/catalog', catalogRouter);
app.use('/quotations', quotationRouter);

// Global error handler
app.use((err: Error & { status?: number; statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400)) {
    res.status(400).json({ error: 'Invalid JSON in request body' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
