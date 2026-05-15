import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(rootDir, '/frontend/dist')));
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/dashboard', dashboardRoutes);

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(rootDir, 'frontend', 'dist', 'index.html'))
  );
}

app.use(notFound);
app.use(errorHandler);

export default app;
