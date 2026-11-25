import bcrypt from 'bcryptjs';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { env } from '../config/env.js';
import { AdminModel } from '../models/Admin.js';

export interface StoredAdmin {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredPlot {
  _id: string;
  title: string;
  plotNumber: string;
  lengthFt: number;
  widthFt: number;
  areaSqFt: number;
  size: string;
  block: string;
  category: 'Residential' | 'Commercial' | 'Mixed Use';
  price: number;
  pricePerSqFt: number;
  description: string;
  features: string[];
  dimensions?: string;
  facing?: string;
  images: { url: string; publicId: string }[];
  status: 'Available' | 'Reserved' | 'Sold';
  createdAt: string;
  updatedAt: string;
}

export interface StoredOrder {
  _id: string;
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  plotId: string;
  message: string;
  status: 'New' | 'Contacted' | 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled';
  internalNotes: string;
  confirmedSalePrice?: number;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredPayment {
  _id: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentStatus: 'Completed' | 'Pending' | 'Refunded';
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalStoreData {
  admins: StoredAdmin[];
  plots: StoredPlot[];
  orders: StoredOrder[];
  payments: StoredPayment[];
}

const DATA_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'juddi-data')
  : path.resolve(process.cwd(), 'server', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

let mongoConnected = false;
let connectPromise: Promise<void> | null = null;

export const isMongoConnected = (): boolean =>
  mongoConnected && mongoose.connection.readyState === 1;

function createObjectIdHex(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + random;
}

export function generateId(): string {
  return createObjectIdHex();
}

function hydratePlotFields(plot: StoredPlot): StoredPlot {
  let lengthFt = Number(plot.lengthFt);
  let widthFt = Number(plot.widthFt);

  if ((!Number.isFinite(lengthFt) || lengthFt <= 0) && plot.dimensions) {
    const match = plot.dimensions.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (match) {
      lengthFt = Number(match[1]);
      widthFt = Number(match[2]);
    }
  }
  if (!Number.isFinite(lengthFt) || lengthFt <= 0) lengthFt = 30;
  if (!Number.isFinite(widthFt) || widthFt <= 0) widthFt = 50;

  const areaSqFt = Number((lengthFt * widthFt).toFixed(2));
  const pricePerSqFt = areaSqFt > 0 ? Number((plot.price / areaSqFt).toFixed(2)) : 0;

  return {
    ...plot,
    lengthFt,
    widthFt,
    areaSqFt,
    pricePerSqFt,
    dimensions: `${lengthFt} x ${widthFt} ft`,
    size: `${areaSqFt.toLocaleString('en-US')} sq ft`,
  };
}

export function readLocalStore(): LocalStoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial: LocalStoreData = {
      admins: [],
      plots: [],
      orders: [],
      payments: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  const raw = fs.readFileSync(STORE_PATH, 'utf8');
  const parsed = JSON.parse(raw) as LocalStoreData;
  parsed.plots = (parsed.plots || []).map(hydratePlotFields);
  return parsed;
}

export function writeLocalStore(data: LocalStoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function seedEnvAdminIfConfigured(): Promise<void> {
  if (!env.adminEmail || !env.adminPassword) {
    return;
  }

  const hashedPassword = await bcrypt.hash(env.adminPassword, 12);

  if (mongoConnected) {
    const existing = await AdminModel.findOne({ email: env.adminEmail });
    if (!existing) {
      await AdminModel.create({
        name: 'Scheme Administrator',
        email: env.adminEmail,
        password: hashedPassword,
      });
    } else {
      existing.password = hashedPassword;
      await existing.save();
    }
    return;
  }

  const store = readLocalStore();
  const idx = store.admins.findIndex((a) => a.email === env.adminEmail);
  const now = new Date().toISOString();
  if (idx === -1) {
    store.admins.push({
      _id: generateId(),
      name: 'Scheme Administrator',
      email: env.adminEmail,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    store.admins[idx].password = hashedPassword;
    store.admins[idx].updatedAt = now;
  }
  writeLocalStore(store);
}

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    mongoConnected = true;
    return;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    if (env.mongodbUri) {
      try {
        await mongoose.connect(env.mongodbUri, {
          serverSelectionTimeoutMS: 5000,
        });
        mongoConnected = true;
        console.log('Connected to MongoDB via Mongoose.');

        await seedEnvAdminIfConfigured();
        return;
      } catch (err) {
        console.error('MongoDB connection failed, falling back to local datastore:', err);
        mongoConnected = false;
      }
    }

    readLocalStore();
    await seedEnvAdminIfConfigured();
    console.log('Using local persistent datastore (set MONGODB_URI in environment to connect MongoDB).');
  })();

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
  }
}
