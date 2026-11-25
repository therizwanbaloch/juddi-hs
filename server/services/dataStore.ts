import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  generateId,
  isMongoConnected,
  readLocalStore,
  StoredAdmin,
  StoredOrder,
  StoredPayment,
  StoredPlot,
  writeLocalStore,
} from '../config/db.js';
import { AdminModel } from '../models/Admin.js';
import { OrderModel, OrderStatus } from '../models/Order.js';
import { PaymentModel, PaymentStatus } from '../models/Payment.js';
import { PlotCategory, PlotModel, PlotStatus } from '../models/Plot.js';

export interface PlotQueryFilters {
  category?: string;
  size?: string;
  block?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PopulatedOrder extends StoredOrder {
  plot?: {
    _id: string;
    title: string;
    plotNumber: string;
    lengthFt: number;
    widthFt: number;
    areaSqFt: number;
    size: string;
    block: string;
    category: PlotCategory;
    price: number;
    pricePerSqFt: number;
    status: PlotStatus;
    images: { url: string; publicId: string }[];
  } | null;
}

export interface PopulatedPayment extends StoredPayment {
  order?: {
    _id: string;
    orderId: string;
    customerName: string;
    confirmedSalePrice?: number;
  } | null;
}

function normalizeDoc<T>(doc: unknown): T {
  const plain =
    doc && typeof (doc as { toObject?: () => unknown }).toObject === 'function'
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : (doc as Record<string, unknown>);
  return {
    ...plain,
    _id: String(plain._id),
    createdAt:
      plain.createdAt instanceof Date
        ? plain.createdAt.toISOString()
        : String(plain.createdAt),
    updatedAt:
      plain.updatedAt instanceof Date
        ? plain.updatedAt.toISOString()
        : String(plain.updatedAt),
  } as T;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------- ADMIN OPERATIONS ----------------

export async function getAdminCount(): Promise<number> {
  if (isMongoConnected()) {
    return AdminModel.countDocuments();
  }
  return readLocalStore().admins.length;
}

export async function findAdminByEmail(email: string): Promise<StoredAdmin | null> {
  const normalized = email.trim().toLowerCase();
  if (isMongoConnected()) {
    const doc = await AdminModel.findOne({ email: normalized });
    return doc ? normalizeDoc<StoredAdmin>(doc) : null;
  }
  const store = readLocalStore();
  return store.admins.find((a) => a.email === normalized) || null;
}

export async function findAdminById(id: string): Promise<StoredAdmin | null> {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await AdminModel.findById(id);
    return doc ? normalizeDoc<StoredAdmin>(doc) : null;
  }
  return readLocalStore().admins.find((a) => a._id === id) || null;
}

export async function createInitialAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<StoredAdmin> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const email = input.email.trim().toLowerCase();

  if (isMongoConnected()) {
    const existingCount = await AdminModel.countDocuments();
    if (existingCount > 0) {
      throw new Error('Admin account already exists.');
    }
    const created = await AdminModel.create({
      name: input.name.trim(),
      email,
      password: passwordHash,
    });
    return normalizeDoc<StoredAdmin>(created);
  }

  const store = readLocalStore();
  if (store.admins.length > 0) {
    throw new Error('Admin account already exists.');
  }
  const now = new Date().toISOString();
  const admin: StoredAdmin = {
    _id: generateId(),
    name: input.name.trim(),
    email,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  };
  store.admins.push(admin);
  writeLocalStore(store);
  return admin;
}

export async function updateAdminPassword(
  adminId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  if (isMongoConnected()) {
    await AdminModel.findByIdAndUpdate(adminId, { password: passwordHash });
    return;
  }
  const store = readLocalStore();
  const idx = store.admins.findIndex((a) => a._id === adminId);
  if (idx === -1) throw new Error('Admin not found');
  store.admins[idx].password = passwordHash;
  store.admins[idx].updatedAt = new Date().toISOString();
  writeLocalStore(store);
}

// ---------------- PLOT OPERATIONS ----------------

export async function queryPlots(filters: PlotQueryFilters): Promise<{
  plots: StoredPlot[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    blocks: string[];
    sizes: string[];
  };
}> {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(filters.limit) || 12));

  if (isMongoConnected()) {
    const query: Record<string, unknown> = {};
    if (filters.category && filters.category !== 'All') {
      query.category = filters.category;
    }
    if (filters.size && filters.size !== 'All') {
      query.size = filters.size;
    }
    if (filters.block && filters.block !== 'All') {
      query.block = filters.block;
    }
    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }
    if (
      (filters.minPrice !== undefined && !Number.isNaN(filters.minPrice)) ||
      (filters.maxPrice !== undefined && !Number.isNaN(filters.maxPrice))
    ) {
      const priceFilter: Record<string, number> = {};
      if (filters.minPrice !== undefined && !Number.isNaN(filters.minPrice)) {
        priceFilter.$gte = Number(filters.minPrice);
      }
      if (filters.maxPrice !== undefined && !Number.isNaN(filters.maxPrice)) {
        priceFilter.$lte = Number(filters.maxPrice);
      }
      query.price = priceFilter;
    }
    if (
      (filters.minArea !== undefined && !Number.isNaN(filters.minArea)) ||
      (filters.maxArea !== undefined && !Number.isNaN(filters.maxArea))
    ) {
      const areaFilter: Record<string, number> = {};
      if (filters.minArea !== undefined && !Number.isNaN(filters.minArea)) {
        areaFilter.$gte = Number(filters.minArea);
      }
      if (filters.maxArea !== undefined && !Number.isNaN(filters.maxArea)) {
        areaFilter.$lte = Number(filters.maxArea);
      }
      query.areaSqFt = areaFilter;
    }
    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(escapeRegExp(filters.search.trim()), 'i');
      query.$or = [
        { title: regex },
        { plotNumber: regex },
        { block: regex },
        { size: regex },
        { dimensions: regex },
        { description: regex },
      ];
    }

    const [total, docs, allBlocks, allSizes] = await Promise.all([
      PlotModel.countDocuments(query),
      PlotModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PlotModel.distinct('block'),
      PlotModel.distinct('size'),
    ]);

    return {
      plots: docs.map((d) => normalizeDoc<StoredPlot>(d)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      facets: {
        blocks: (allBlocks as string[]).sort(),
        sizes: (allSizes as string[]).sort(),
      },
    };
  }

  const store = readLocalStore();
  const blocksSet = new Set(store.plots.map((p) => p.block));
  const sizesSet = new Set(store.plots.map((p) => p.size));

  let filtered = [...store.plots];

  if (filters.category && filters.category !== 'All') {
    filtered = filtered.filter((p) => p.category === filters.category);
  }
  if (filters.size && filters.size !== 'All') {
    filtered = filtered.filter((p) => p.size === filters.size);
  }
  if (filters.block && filters.block !== 'All') {
    filtered = filtered.filter((p) => p.block === filters.block);
  }
  if (filters.status && filters.status !== 'All') {
    filtered = filtered.filter((p) => p.status === filters.status);
  }
  if (filters.minPrice !== undefined && !Number.isNaN(filters.minPrice)) {
    filtered = filtered.filter((p) => p.price >= Number(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && !Number.isNaN(filters.maxPrice)) {
    filtered = filtered.filter((p) => p.price <= Number(filters.maxPrice));
  }
  if (filters.minArea !== undefined && !Number.isNaN(filters.minArea)) {
    filtered = filtered.filter((p) => p.areaSqFt >= Number(filters.minArea));
  }
  if (filters.maxArea !== undefined && !Number.isNaN(filters.maxArea)) {
    filtered = filtered.filter((p) => p.areaSqFt <= Number(filters.maxArea));
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.plotNumber.toLowerCase().includes(q) ||
        p.block.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q) ||
        (p.dimensions || '').toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    plots: paginated,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    facets: {
      blocks: Array.from(blocksSet).sort(),
      sizes: Array.from(sizesSet).sort(),
    },
  };
}

export async function getPlotById(id: string): Promise<StoredPlot | null> {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await PlotModel.findById(id);
    return doc ? normalizeDoc<StoredPlot>(doc) : null;
  }
  return readLocalStore().plots.find((p) => p._id === id) || null;
}

export async function createPlot(
  input: Omit<
    StoredPlot,
    '_id' | 'createdAt' | 'updatedAt' | 'areaSqFt' | 'pricePerSqFt' | 'size' | 'dimensions'
  >
): Promise<StoredPlot> {
  const plotNumber = input.plotNumber.trim().toUpperCase();
  const lengthFt = Number(input.lengthFt);
  const widthFt = Number(input.widthFt);
  const areaSqFt = Number((lengthFt * widthFt).toFixed(2));
  const pricePerSqFt = areaSqFt > 0 ? Number((input.price / areaSqFt).toFixed(2)) : 0;
  const dimensions = `${lengthFt} x ${widthFt} ft`;
  const size = `${areaSqFt.toLocaleString('en-US')} sq ft`;

  const payload = {
    ...input,
    plotNumber,
    lengthFt,
    widthFt,
    areaSqFt,
    pricePerSqFt,
    dimensions,
    size,
  };

  if (isMongoConnected()) {
    const exists = await PlotModel.findOne({ plotNumber });
    if (exists) {
      throw new Error(`Plot number ${plotNumber} already exists.`);
    }
    const created = await PlotModel.create(payload);
    return normalizeDoc<StoredPlot>(created);
  }

  const store = readLocalStore();
  if (store.plots.some((p) => p.plotNumber.toUpperCase() === plotNumber)) {
    throw new Error(`Plot number ${plotNumber} already exists.`);
  }
  const now = new Date().toISOString();
  const plot: StoredPlot = {
    ...payload,
    _id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  store.plots.push(plot);
  writeLocalStore(store);
  return plot;
}

export async function updatePlot(
  id: string,
  updates: Partial<Omit<StoredPlot, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<StoredPlot | null> {
  if (updates.plotNumber) {
    updates.plotNumber = updates.plotNumber.trim().toUpperCase();
  }

  const existing = await getPlotById(id);
  if (!existing) return null;

  const lengthFt =
    updates.lengthFt !== undefined ? Number(updates.lengthFt) : existing.lengthFt;
  const widthFt =
    updates.widthFt !== undefined ? Number(updates.widthFt) : existing.widthFt;
  const price = updates.price !== undefined ? Number(updates.price) : existing.price;

  const areaSqFt = Number((lengthFt * widthFt).toFixed(2));
  const pricePerSqFt = areaSqFt > 0 ? Number((price / areaSqFt).toFixed(2)) : 0;

  const computedUpdates = {
    ...updates,
    lengthFt,
    widthFt,
    price,
    areaSqFt,
    pricePerSqFt,
    dimensions: `${lengthFt} x ${widthFt} ft`,
    size: `${areaSqFt.toLocaleString('en-US')} sq ft`,
  };

  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    if (computedUpdates.plotNumber) {
      const conflict = await PlotModel.findOne({
        plotNumber: computedUpdates.plotNumber,
        _id: { $ne: id },
      });
      if (conflict) {
        throw new Error(`Plot number ${computedUpdates.plotNumber} already exists.`);
      }
    }
    const updated = await PlotModel.findByIdAndUpdate(id, computedUpdates, {
      new: true,
      runValidators: true,
    });
    return updated ? normalizeDoc<StoredPlot>(updated) : null;
  }

  const store = readLocalStore();
  const idx = store.plots.findIndex((p) => p._id === id);
  if (idx === -1) return null;

  if (
    computedUpdates.plotNumber &&
    store.plots.some(
      (p) => p._id !== id && p.plotNumber.toUpperCase() === computedUpdates.plotNumber
    )
  ) {
    throw new Error(`Plot number ${computedUpdates.plotNumber} already exists.`);
  }

  store.plots[idx] = {
    ...store.plots[idx],
    ...computedUpdates,
    updatedAt: new Date().toISOString(),
  };
  writeLocalStore(store);
  return store.plots[idx];
}

export async function deletePlot(id: string): Promise<StoredPlot | null> {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const deleted = await PlotModel.findByIdAndDelete(id);
    return deleted ? normalizeDoc<StoredPlot>(deleted) : null;
  }

  const store = readLocalStore();
  const idx = store.plots.findIndex((p) => p._id === id);
  if (idx === -1) return null;
  const [deleted] = store.plots.splice(idx, 1);
  writeLocalStore(store);
  return deleted;
}

// ---------------- ORDER OPERATIONS ----------------

function generateOrderId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `JHS-${y}${m}${day}-${suffix}`;
}

export async function createBookingOrder(input: {
  customerName: string;
  phone: string;
  email: string;
  plotId: string;
  message: string;
}): Promise<PopulatedOrder> {
  const plot = await getPlotById(input.plotId);
  if (!plot) {
    throw new Error('Selected plot was not found.');
  }
  if (plot.status === 'Sold') {
    throw new Error(
      'This plot has already been sold and is no longer accepting booking requests.'
    );
  }

  const orderId = generateOrderId();

  if (isMongoConnected()) {
    const created = await OrderModel.create({
      orderId,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim().toLowerCase(),
      plotId: plot._id,
      message: input.message.trim(),
      status: 'New',
      internalNotes: '',
    });
    const normalized = normalizeDoc<StoredOrder>(created);
    return {
      ...normalized,
      plotId: String(normalized.plotId),
      plot: {
        _id: plot._id,
        title: plot.title,
        plotNumber: plot.plotNumber,
        lengthFt: plot.lengthFt,
        widthFt: plot.widthFt,
        areaSqFt: plot.areaSqFt,
        size: plot.size,
        block: plot.block,
        category: plot.category,
        price: plot.price,
        pricePerSqFt: plot.pricePerSqFt,
        status: plot.status,
        images: plot.images,
      },
    };
  }

  const store = readLocalStore();
  const now = new Date().toISOString();
  const order: StoredOrder = {
    _id: generateId(),
    orderId,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    plotId: plot._id,
    message: input.message.trim(),
    status: 'New',
    internalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
  store.orders.push(order);
  writeLocalStore(store);

  return {
    ...order,
    plot: {
      _id: plot._id,
      title: plot.title,
      plotNumber: plot.plotNumber,
      lengthFt: plot.lengthFt,
      widthFt: plot.widthFt,
      areaSqFt: plot.areaSqFt,
      size: plot.size,
      block: plot.block,
      category: plot.category,
      price: plot.price,
      pricePerSqFt: plot.pricePerSqFt,
      status: plot.status,
      images: plot.images,
    },
  };
}

export async function listOrders(filters: {
  status?: string;
  search?: string;
}): Promise<PopulatedOrder[]> {
  if (isMongoConnected()) {
    const query: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }
    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(escapeRegExp(filters.search.trim()), 'i');
      query.$or = [
        { orderId: regex },
        { customerName: regex },
        { phone: regex },
        { email: regex },
      ];
    }
    const docs = await OrderModel.find(query)
      .populate('plotId')
      .sort({ createdAt: -1 });

    return docs.map((d) => {
      const obj = d.toObject() as Record<string, unknown>;
      const populatedPlot = obj.plotId as Record<string, unknown> | null;
      return {
        _id: String(obj._id),
        orderId: String(obj.orderId),
        customerName: String(obj.customerName),
        phone: String(obj.phone),
        email: String(obj.email),
        plotId: populatedPlot ? String(populatedPlot._id) : '',
        message: String(obj.message || ''),
        status: obj.status as OrderStatus,
        internalNotes: String(obj.internalNotes || ''),
        confirmedSalePrice:
          typeof obj.confirmedSalePrice === 'number'
            ? obj.confirmedSalePrice
            : undefined,
        confirmedAt:
          obj.confirmedAt instanceof Date
            ? obj.confirmedAt.toISOString()
            : obj.confirmedAt
              ? String(obj.confirmedAt)
              : undefined,
        createdAt:
          obj.createdAt instanceof Date
            ? obj.createdAt.toISOString()
            : String(obj.createdAt),
        updatedAt:
          obj.updatedAt instanceof Date
            ? obj.updatedAt.toISOString()
            : String(obj.updatedAt),
        plot: populatedPlot
          ? {
              _id: String(populatedPlot._id),
              title: String(populatedPlot.title),
              plotNumber: String(populatedPlot.plotNumber),
              lengthFt: Number(populatedPlot.lengthFt || 0),
              widthFt: Number(populatedPlot.widthFt || 0),
              areaSqFt: Number(populatedPlot.areaSqFt || 0),
              size: String(populatedPlot.size),
              block: String(populatedPlot.block),
              category: populatedPlot.category as PlotCategory,
              price: Number(populatedPlot.price),
              pricePerSqFt: Number(populatedPlot.pricePerSqFt || 0),
              status: populatedPlot.status as PlotStatus,
              images: (populatedPlot.images as { url: string; publicId: string }[]) || [],
            }
          : null,
      };
    });
  }

  const store = readLocalStore();
  const plotMap = new Map(store.plots.map((p) => [p._id, p]));

  let results: PopulatedOrder[] = store.orders.map((o) => {
    const plot = plotMap.get(o.plotId) || null;
    return {
      ...o,
      plot: plot
        ? {
            _id: plot._id,
            title: plot.title,
            plotNumber: plot.plotNumber,
            lengthFt: plot.lengthFt,
            widthFt: plot.widthFt,
            areaSqFt: plot.areaSqFt,
            size: plot.size,
            block: plot.block,
            category: plot.category,
            price: plot.price,
            pricePerSqFt: plot.pricePerSqFt,
            status: plot.status,
            images: plot.images,
          }
        : null,
    };
  });

  if (filters.status && filters.status !== 'All') {
    results = results.filter((o) => o.status === filters.status);
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (o.plot?.plotNumber.toLowerCase().includes(q) ?? false) ||
        (o.plot?.title.toLowerCase().includes(q) ?? false)
    );
  }

  results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return results;
}

export async function updateOrderByAdmin(
  id: string,
  updates: {
    status?: OrderStatus;
    internalNotes?: string;
    confirmedSalePrice?: number;
  }
): Promise<PopulatedOrder | null> {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const order = await OrderModel.findById(id);
    if (!order) return null;

    const plot = await PlotModel.findById(order.plotId);

    if (updates.status === 'Confirmed' && order.status !== 'Confirmed') {
      if (!plot) {
        throw new Error('Associated plot no longer exists.');
      }
      if (plot.status === 'Sold') {
        throw new Error('This plot is already marked as Sold.');
      }
      const existingConfirmed = await OrderModel.findOne({
        plotId: order.plotId,
        status: 'Confirmed',
        _id: { $ne: order._id },
      });
      if (existingConfirmed) {
        throw new Error(
          `Plot ${plot.plotNumber} already has a confirmed sale (${existingConfirmed.orderId}).`
        );
      }

      order.status = 'Confirmed';
      order.confirmedSalePrice =
        updates.confirmedSalePrice !== undefined && updates.confirmedSalePrice >= 0
          ? Number(updates.confirmedSalePrice)
          : plot.price;
      order.confirmedAt = new Date();
      plot.status = 'Sold';
      await plot.save();
    } else if (updates.status) {
      if (order.status === 'Confirmed' && updates.status !== 'Confirmed') {
        throw new Error(
          'Confirmed sale status is locked. Manage plot availability directly in Manage Plots if needed.'
        );
      }
      order.status = updates.status;
    }

    if (updates.internalNotes !== undefined) {
      order.internalNotes = updates.internalNotes.trim();
    }

    await order.save();
    const all = await listOrders({});
    return all.find((o) => o._id === String(order._id)) || null;
  }

  const store = readLocalStore();
  const orderIdx = store.orders.findIndex((o) => o._id === id);
  if (orderIdx === -1) return null;

  const order = store.orders[orderIdx];
  const plotIdx = store.plots.findIndex((p) => p._id === order.plotId);
  const plot = plotIdx !== -1 ? store.plots[plotIdx] : null;
  const now = new Date().toISOString();

  if (updates.status === 'Confirmed' && order.status !== 'Confirmed') {
    if (!plot) {
      throw new Error('Associated plot no longer exists.');
    }
    if (plot.status === 'Sold') {
      throw new Error('This plot is already marked as Sold.');
    }
    const duplicate = store.orders.find(
      (o) => o.plotId === order.plotId && o.status === 'Confirmed' && o._id !== order._id
    );
    if (duplicate) {
      throw new Error(
        `Plot ${plot.plotNumber} already has a confirmed sale (${duplicate.orderId}).`
      );
    }

    order.status = 'Confirmed';
    order.confirmedSalePrice =
      updates.confirmedSalePrice !== undefined && updates.confirmedSalePrice >= 0
        ? Number(updates.confirmedSalePrice)
        : plot.price;
    order.confirmedAt = now;
    store.plots[plotIdx].status = 'Sold';
    store.plots[plotIdx].updatedAt = now;
  } else if (updates.status) {
    if (order.status === 'Confirmed' && updates.status !== 'Confirmed') {
      throw new Error('Confirmed sale status is locked.');
    }
    order.status = updates.status;
  }

  if (updates.internalNotes !== undefined) {
    order.internalNotes = updates.internalNotes.trim();
  }

  order.updatedAt = now;
  store.orders[orderIdx] = order;
  writeLocalStore(store);

  return {
    ...order,
    plot: plot
      ? {
          _id: plot._id,
          title: plot.title,
          plotNumber: plot.plotNumber,
          lengthFt: plot.lengthFt,
          widthFt: plot.widthFt,
          areaSqFt: plot.areaSqFt,
          size: plot.size,
          block: plot.block,
          category: plot.category,
          price: plot.price,
          pricePerSqFt: plot.pricePerSqFt,
          status: plot.status,
          images: plot.images,
        }
      : null,
  };
}

// ---------------- PAYMENT OPERATIONS ----------------

export async function createPaymentRecord(input: {
  orderId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  paymentDate?: string;
  paymentStatus?: PaymentStatus;
}): Promise<PopulatedPayment> {
  const orders = await listOrders({});
  const order = orders.find((o) => o._id === input.orderId);
  if (!order) {
    throw new Error('Order not found.');
  }
  if (order.status !== 'Confirmed') {
    throw new Error('Payments can only be recorded for Confirmed sales.');
  }

  if (isMongoConnected()) {
    const created = await PaymentModel.create({
      orderId: order._id,
      amount: Number(input.amount),
      paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
      paymentMethod: input.paymentMethod.trim(),
      paymentStatus: input.paymentStatus || 'Completed',
      referenceNumber: input.referenceNumber.trim(),
    });
    const norm = normalizeDoc<StoredPayment>(created);
    return {
      ...norm,
      orderId: String(norm.orderId),
      paymentDate:
        created.paymentDate instanceof Date
          ? created.paymentDate.toISOString()
          : String(created.paymentDate),
      order: {
        _id: order._id,
        orderId: order.orderId,
        customerName: order.customerName,
        confirmedSalePrice: order.confirmedSalePrice,
      },
    };
  }

  const store = readLocalStore();
  const now = new Date().toISOString();
  const payment: StoredPayment = {
    _id: generateId(),
    orderId: order._id,
    amount: Number(input.amount),
    paymentDate: input.paymentDate
      ? new Date(input.paymentDate).toISOString()
      : now,
    paymentMethod: input.paymentMethod.trim(),
    paymentStatus: input.paymentStatus || 'Completed',
    referenceNumber: input.referenceNumber.trim(),
    createdAt: now,
    updatedAt: now,
  };
  store.payments.push(payment);
  writeLocalStore(store);

  return {
    ...payment,
    order: {
      _id: order._id,
      orderId: order.orderId,
      customerName: order.customerName,
      confirmedSalePrice: order.confirmedSalePrice,
    },
  };
}

export async function listPayments(): Promise<PopulatedPayment[]> {
  if (isMongoConnected()) {
    const docs = await PaymentModel.find()
      .populate('orderId')
      .sort({ paymentDate: -1 });
    return docs.map((d) => {
      const obj = d.toObject() as Record<string, unknown>;
      const popOrder = obj.orderId as Record<string, unknown> | null;
      return {
        _id: String(obj._id),
        orderId: popOrder ? String(popOrder._id) : '',
        amount: Number(obj.amount),
        paymentDate:
          obj.paymentDate instanceof Date
            ? obj.paymentDate.toISOString()
            : String(obj.paymentDate),
        paymentMethod: String(obj.paymentMethod),
        paymentStatus: obj.paymentStatus as PaymentStatus,
        referenceNumber: String(obj.referenceNumber),
        createdAt:
          obj.createdAt instanceof Date
            ? obj.createdAt.toISOString()
            : String(obj.createdAt),
        updatedAt:
          obj.updatedAt instanceof Date
            ? obj.updatedAt.toISOString()
            : String(obj.updatedAt),
        order: popOrder
          ? {
              _id: String(popOrder._id),
              orderId: String(popOrder.orderId),
              customerName: String(popOrder.customerName),
              confirmedSalePrice:
                typeof popOrder.confirmedSalePrice === 'number'
                  ? popOrder.confirmedSalePrice
                  : undefined,
            }
          : null,
      };
    });
  }

  const store = readLocalStore();
  const orderMap = new Map(store.orders.map((o) => [o._id, o]));
  return [...store.payments]
    .sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )
    .map((p) => {
      const order = orderMap.get(p.orderId) || null;
      return {
        ...p,
        order: order
          ? {
              _id: order._id,
              orderId: order.orderId,
              customerName: order.customerName,
              confirmedSalePrice: order.confirmedSalePrice,
            }
          : null,
      };
    });
}

// ---------------- ANALYTICS & DASHBOARD ----------------

export async function getDashboardAnalytics(params: {
  from?: string;
  to?: string;
}) {
  const [plotsRes, allOrders, allPayments] = await Promise.all([
    queryPlots({ limit: 500 }),
    listOrders({}),
    listPayments(),
  ]);

  const plots = plotsRes.plots;
  const fromDate = params.from ? new Date(params.from) : null;
  const toDate = params.to ? new Date(params.to) : null;
  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }

  const inDateRange = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  };

  const filteredOrders =
    fromDate || toDate
      ? allOrders.filter((o) => inDateRange(o.createdAt))
      : allOrders;

  const confirmedOrders = allOrders.filter((o) => {
    if (o.status !== 'Confirmed') return false;
    if (!fromDate && !toDate) return true;
    return inDateRange(o.confirmedAt || o.updatedAt);
  });

  const completedPayments = allPayments.filter((p) => {
    if (p.paymentStatus !== 'Completed') return false;
    if (!fromDate && !toDate) return true;
    return inDateRange(p.paymentDate);
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const sumConfirmed = (list: PopulatedOrder[]) =>
    list.reduce((sum, o) => sum + (o.confirmedSalePrice ?? o.plot?.price ?? 0), 0);

  const allConfirmed = allOrders.filter((o) => o.status === 'Confirmed');
  const todayConfirmed = allConfirmed.filter(
    (o) => new Date(o.confirmedAt || o.updatedAt) >= startOfToday
  );
  const weekConfirmed = allConfirmed.filter(
    (o) => new Date(o.confirmedAt || o.updatedAt) >= startOfWeek
  );
  const monthConfirmed = allConfirmed.filter(
    (o) => new Date(o.confirmedAt || o.updatedAt) >= startOfMonth
  );
  const yearConfirmed = allConfirmed.filter(
    (o) => new Date(o.confirmedAt || o.updatedAt) >= startOfYear
  );

  // Daily chart buckets (last 14 days)
  const dailySeries: { label: string; salesCount: number; salesValue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dEnd = new Date(
      dStart.getFullYear(),
      dStart.getMonth(),
      dStart.getDate(),
      23,
      59,
      59,
      999
    );
    const matching = confirmedOrders.filter((o) => {
      const dt = new Date(o.confirmedAt || o.updatedAt);
      return dt >= dStart && dt <= dEnd;
    });
    dailySeries.push({
      label: dStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      salesCount: matching.length,
      salesValue: sumConfirmed(matching),
    });
  }

  // Weekly chart buckets (last 8 weeks)
  const weeklySeries: { label: string; salesCount: number; salesValue: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const bucketEnd = new Date(now);
    bucketEnd.setDate(now.getDate() - i * 7);
    bucketEnd.setHours(23, 59, 59, 999);
    const bucketStart = new Date(bucketEnd);
    bucketStart.setDate(bucketEnd.getDate() - 6);
    bucketStart.setHours(0, 0, 0, 0);

    const matching = confirmedOrders.filter((o) => {
      const dt = new Date(o.confirmedAt || o.updatedAt);
      return dt >= bucketStart && dt <= bucketEnd;
    });

    weeklySeries.push({
      label: `${bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      salesCount: matching.length,
      salesValue: sumConfirmed(matching),
    });
  }

  // Monthly chart buckets (last 12 months)
  const monthlySeries: {
    label: string;
    salesCount: number;
    salesValue: number;
    collectedAmount: number;
  }[] = [];

  for (let i = 11; i >= 0; i--) {
    const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(mDate.getFullYear(), mDate.getMonth(), 1);
    const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const matchingSales = confirmedOrders.filter((o) => {
      const dt = new Date(o.confirmedAt || o.updatedAt);
      return dt >= mStart && dt <= mEnd;
    });

    const matchingPayments = completedPayments.filter((p) => {
      const dt = new Date(p.paymentDate);
      return dt >= mStart && dt <= mEnd;
    });

    monthlySeries.push({
      label: mDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      salesCount: matchingSales.length,
      salesValue: sumConfirmed(matchingSales),
      collectedAmount: matchingPayments.reduce((s, p) => s + p.amount, 0),
    });
  }

  // Yearly buckets (last 4 years including current)
  const yearlySeries: { label: string; salesCount: number; salesValue: number }[] = [];
  for (let y = now.getFullYear() - 3; y <= now.getFullYear(); y++) {
    const matching = confirmedOrders.filter(
      (o) => new Date(o.confirmedAt || o.updatedAt).getFullYear() === y
    );
    yearlySeries.push({
      label: String(y),
      salesCount: matching.length,
      salesValue: sumConfirmed(matching),
    });
  }

  // Plot availability breakdown
  const categories: PlotCategory[] = ['Residential', 'Commercial', 'Mixed Use'];
  const plotAvailabilityByCategory = categories.map((cat) => {
    const subset = plots.filter((p) => p.category === cat);
    return {
      category: cat,
      Available: subset.filter((p) => p.status === 'Available').length,
      Reserved: subset.filter((p) => p.status === 'Reserved').length,
      Sold: subset.filter((p) => p.status === 'Sold').length,
    };
  });

  const totalPlots = plots.length;
  const availablePlots = plots.filter((p) => p.status === 'Available').length;
  const reservedPlots = plots.filter((p) => p.status === 'Reserved').length;
  const soldPlots = plots.filter((p) => p.status === 'Sold').length;

  const pendingStatuses: OrderStatus[] = ['New', 'Contacted', 'Pending'];
  const pendingOrders = filteredOrders.filter((o) =>
    pendingStatuses.includes(o.status)
  ).length;

  const confirmedSalesValue = sumConfirmed(confirmedOrders);
  const collectedPaymentsTotal = completedPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  return {
    summary: {
      totalPlots,
      availablePlots,
      reservedPlots,
      soldPlots,
      totalBookingOrders: filteredOrders.length,
      pendingOrders,
      confirmedSalesCount: confirmedOrders.length,
      confirmedSalesValue,
      collectedPaymentsTotal,
    },
    periods: {
      today: {
        count: todayConfirmed.length,
        value: sumConfirmed(todayConfirmed),
      },
      weekly: {
        count: weekConfirmed.length,
        value: sumConfirmed(weekConfirmed),
      },
      monthly: {
        count: monthConfirmed.length,
        value: sumConfirmed(monthConfirmed),
      },
      yearly: {
        count: yearConfirmed.length,
        value: sumConfirmed(yearConfirmed),
      },
    },
    charts: {
      dailySeries,
      weeklySeries,
      monthlySeries,
      yearlySeries,
      plotAvailabilityByCategory,
    },
    salesHistory: confirmedOrders,
    recentOrders: filteredOrders.slice(0, 6),
    payments: completedPayments,
  };
}
