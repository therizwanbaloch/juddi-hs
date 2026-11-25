import bcrypt from 'bcryptjs';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { env } from '../config/env.js';
import { AdminModel } from '../models/Admin.js';
import { PlotModel } from '../models/Plot.js';

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

function buildPlotMetrics(lengthFt: number, widthFt: number, price: number) {
  const areaSqFt = Number((lengthFt * widthFt).toFixed(2));
  const pricePerSqFt = areaSqFt > 0 ? Number((price / areaSqFt).toFixed(2)) : 0;
  return {
    lengthFt,
    widthFt,
    areaSqFt,
    pricePerSqFt,
    dimensions: `${lengthFt} x ${widthFt} ft`,
    size: `${areaSqFt.toLocaleString('en-US')} sq ft`,
  };
}

const SEED_PLOTS: Omit<StoredPlot, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Sea Breeze 2,275 sq ft Residential Plot',
    plotNumber: 'A-104',
    ...buildPlotMetrics(35, 65, 4500000),
    block: 'Block A',
    category: 'Residential',
    price: 4500000,
    facing: 'Park Facing',
    description:
      'Prime 2,275 sq ft residential plot situated in Block A along a 60-foot carpeted avenue, offering unobstructed coastal breeze and immediate proximity to the Central Mosque and Family Park.',
    features: [
      '60 ft Paved Boulevard',
      'Underground Electricity Ready',
      'Clean Municipal Water Line',
      'Adjacent to Central Park',
      '24/7 Gated Security',
    ],
    images: [
      {
        url: '/src/assets/images/residential_villa_plot_1795441093419.jpg',
        publicId: 'seed:residential_1',
      },
      {
        url: '/src/assets/images/colony_boulevard_gate_1795441093203.jpg',
        publicId: 'seed:boulevard_1',
      },
    ],
    status: 'Available',
  },
  {
    title: 'Coastal Corner 4,500 sq ft Villa Plot',
    plotNumber: 'A-201',
    ...buildPlotMetrics(50, 90, 8800000),
    block: 'Block A',
    category: 'Residential',
    price: 8800000,
    facing: 'Corner · Main Boulevard',
    description:
      'Prestigious 4,500 sq ft corner residential plot designed for custom coastal villa construction, positioned near the grand scheme entrance with extra corner frontage.',
    features: [
      'Corner Dual-Road Access',
      '80 ft Main Boulevard Proximity',
      'Elevated Coastal Views',
      'Sewerage & Storm Drainage',
      'Clear Title & Possession Ready',
    ],
    images: [
      {
        url: '/src/assets/images/residential_villa_plot_1795441093419.jpg',
        publicId: 'seed:residential_2',
      },
      {
        url: '/src/assets/images/colony_masterplan_aerial_1795441093561.jpg',
        publicId: 'seed:masterplan_2',
      },
    ],
    status: 'Available',
  },
  {
    title: 'Pasni Heritage 1,125 sq ft Family Plot',
    plotNumber: 'B-042',
    ...buildPlotMetrics(25, 45, 2450000),
    block: 'Block B',
    category: 'Residential',
    price: 2450000,
    facing: 'East Open',
    description:
      'Well-proportioned 1,125 sq ft residential plot in peaceful Block B, ideal for modern family homes with walking distance to community school and neighborhood green belt.',
    features: [
      '40 ft Carpeted Street',
      'Near Community School',
      'Reliable Electricity Grid',
      'Dedicated Water Supply',
    ],
    images: [
      {
        url: '/src/assets/images/residential_villa_plot_1795441093419.jpg',
        publicId: 'seed:residential_3',
      },
    ],
    status: 'Available',
  },
  {
    title: 'Horizon 700 sq ft Starter Home Plot',
    plotNumber: 'B-118',
    ...buildPlotMetrics(20, 35, 1550000),
    block: 'Block B',
    category: 'Residential',
    price: 1550000,
    facing: 'North Facing',
    description:
      'Accessible 700 sq ft residential plot crafted for young families and long-term coastal investors seeking high appreciation in Gwadar Old City, Gwadar.',
    features: [
      '30 ft Paved Street',
      'Street Lighting Installed',
      'Gated Community Patrol',
      'Low Maintenance Frontage',
    ],
    images: [
      {
        url: '/src/assets/images/colony_boulevard_gate_1795441093203.jpg',
        publicId: 'seed:boulevard_4',
      },
    ],
    status: 'Available',
  },
  {
    title: 'Gwadar Old City 1,800 sq ft Commercial Plot',
    plotNumber: 'C-008',
    ...buildPlotMetrics(40, 45, 12500000),
    block: 'Commercial Enclave',
    category: 'Commercial',
    price: 12500000,
    facing: 'Main Boulevard',
    description:
      'High-visibility 1,800 sq ft commercial plot fronting the 100-foot main commercial boulevard, approved for multi-story retail showrooms, banking branches, and corporate offices.',
    features: [
      '100 ft Main Commercial Boulevard',
      'Dedicated Visitor Parking Strip',
      'High Footfall Gateway Zone',
      'Three-Phase Commercial Power',
    ],
    images: [
      {
        url: '/src/assets/images/commercial_plaza_plot_1795441093119.jpg',
        publicId: 'seed:commercial_1',
      },
      {
        url: '/src/assets/images/colony_boulevard_gate_1795441093203.jpg',
        publicId: 'seed:boulevard_5',
      },
    ],
    status: 'Available',
  },
  {
    title: 'Makran Business 900 sq ft Retail Plot',
    plotNumber: 'C-019',
    ...buildPlotMetrics(25, 36, 6800000),
    block: 'Commercial Enclave',
    category: 'Commercial',
    price: 6800000,
    facing: 'Boulevard Facing',
    description:
      'Compact 900 sq ft commercial plot tailored for retail outlets, pharmacies, cafes, and regional logistics offices serving Gwadar Old City, Gwadar.',
    features: [
      'Wide Pedestrian Promenade',
      'Modern Sewerage & Utilities',
      'High Rental Yield Potential',
      '24/7 Commercial Security',
    ],
    images: [
      {
        url: '/src/assets/images/commercial_plaza_plot_1795441093119.jpg',
        publicId: 'seed:commercial_2',
      },
    ],
    status: 'Reserved',
  },
  {
    title: 'Arabian View 2,275 sq ft Mixed-Use Corner',
    plotNumber: 'M-003',
    ...buildPlotMetrics(35, 65, 9400000),
    block: 'Block C',
    category: 'Mixed Use',
    price: 9400000,
    facing: 'Corner · Coastal Avenue',
    description:
      'Versatile 2,275 sq ft mixed-use corner plot approved for ground-floor retail storefronts with luxury residential apartments or boutique guest suites above.',
    features: [
      'Ground Retail + Upper Residential Zoning',
      'Corner Exposure on 80 ft Avenue',
      'Fiber & Utility Conduits Ready',
      'Walking Distance to Mosque & Park',
    ],
    images: [
      {
        url: '/src/assets/images/mixed_use_corner_plot_1795441093434.jpg',
        publicId: 'seed:mixed_1',
      },
      {
        url: '/src/assets/images/commercial_plaza_plot_1795441093119.jpg',
        publicId: 'seed:commercial_3',
      },
    ],
    status: 'Available',
  },
  {
    title: 'Gateway Arcade 1,350 sq ft Mixed-Use Plot',
    plotNumber: 'M-014',
    ...buildPlotMetrics(30, 45, 5900000),
    block: 'Block C',
    category: 'Mixed Use',
    price: 5900000,
    facing: 'Main Sector Road',
    description:
      'Strategic 1,350 sq ft mixed-use plot balancing commercial shopfront income with upper-level family living quarters in rapidly developing Block C.',
    features: [
      'Dual Residential-Commercial Approval',
      '60 ft Sector Boulevard Access',
      'Ample Roadside Parking',
      'Modern Infrastructure Grid',
    ],
    images: [
      {
        url: '/src/assets/images/mixed_use_corner_plot_1795441093434.jpg',
        publicId: 'seed:mixed_2',
      },
    ],
    status: 'Available',
  },
];

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
    const now = new Date().toISOString();
    const initial: LocalStoreData = {
      admins: [],
      plots: SEED_PLOTS.map((plot) => ({
        ...plot,
        _id: createObjectIdHex(),
        createdAt: now,
        updatedAt: now,
      })),
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

        const plotCount = await PlotModel.countDocuments();
        if (plotCount === 0) {
          await PlotModel.insertMany(SEED_PLOTS);
          console.log('Seeded initial Juddi Housing Scheme Pasni plots in MongoDB.');
        }
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
