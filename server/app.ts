import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { connectDatabase } from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

export function createApiApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Ensure DB connection is initialized before handling API requests (serverless + Node)
  app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await connectDatabase();
      next();
    } catch (err) {
      next(err);
    }
  });

  // Serve local plot uploads securely when local storage fallback is used
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // REST API endpoints
  app.use('/api', publicRoutes);
  app.use('/api/admin', adminRoutes);

  // Multer & API error handler
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: `Image upload error: ${err.message}` });
      return;
    }
    if (err instanceof Error && err.message.includes('image')) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  });

  return app;
}
