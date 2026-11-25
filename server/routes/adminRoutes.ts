import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { isMongoConnected } from '../config/db.js';
import { env, isCloudinaryConfigured } from '../config/env.js';
import {
  ADMIN_COOKIE_NAME,
  AuthenticatedRequest,
  clearAdminCookie,
  plotImageUpload,
  requireAdminAuth,
  setAdminCookie,
  signAdminToken,
  verifyAdminToken,
} from '../middleware/auth.js';
import { OrderStatus } from '../models/Order.js';
import { PlotCategory, PlotStatus } from '../models/Plot.js';
import {
  createInitialAdmin,
  createPaymentRecord,
  createPlot,
  deletePlot,
  findAdminByEmail,
  findAdminById,
  getAdminCount,
  getDashboardAnalytics,
  getPlotById,
  listOrders,
  listPayments,
  queryPlots,
  updateAdminPassword,
  updateOrderByAdmin,
  updatePlot,
} from '../services/dataStore.js';
import { deletePlotImage, uploadPlotImage } from '../services/mediaService.js';

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CATEGORIES: PlotCategory[] = ['Residential', 'Commercial', 'Mixed Use'];
const VALID_PLOT_STATUSES: PlotStatus[] = ['Available', 'Reserved', 'Sold'];
const VALID_ORDER_STATUSES: OrderStatus[] = [
  'New',
  'Contacted',
  'Pending',
  'Confirmed',
  'Rejected',
  'Cancelled',
];

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is string => typeof item === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

// ---------------- AUTH ROUTES ----------------

router.get('/auth/status', async (req, res) => {
  try {
    const adminCount = await getAdminCount();
    const needsSetup = adminCount === 0 && !env.adminPassword;

    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies && typeof req.cookies[ADMIN_COOKIE_NAME] === 'string') {
      token = req.cookies[ADMIN_COOKIE_NAME];
    }

    const decoded = token ? verifyAdminToken(token) : null;
    const admin = decoded ? await findAdminById(decoded.sub) : null;

    res.json({
      needsSetup,
      authenticated: Boolean(admin),
      admin: admin
        ? { id: admin._id, name: admin.name, email: admin.email }
        : null,
      system: {
        databaseMode: isMongoConnected() ? 'MongoDB (Mongoose)' : 'Local Persistent Store',
        mediaMode: isCloudinaryConfigured() ? 'Cloudinary CDN' : 'Local Secure Storage',
      },
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unable to check auth status.',
    });
  }
});

router.post('/auth/setup', async (req, res) => {
  try {
    const adminCount = await getAdminCount();
    if (adminCount > 0 || env.adminPassword) {
      res.status(403).json({
        error: 'Initial admin setup is already completed.',
      });
      return;
    }

    const { name, email, password } = req.body as Record<string, unknown>;
    if (typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Admin name must be at least 2 characters.' });
      return;
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ error: 'Valid admin email is required.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    const admin = await createInitialAdmin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    const token = signAdminToken({
      sub: admin._id,
      email: admin.email,
      name: admin.name,
    });
    setAdminCookie(res, token);

    res.status(201).json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Admin setup failed.',
    });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as Record<string, unknown>;
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signAdminToken({
      sub: admin._id,
      email: admin.email,
      name: admin.name,
    });
    setAdminCookie(res, token);

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Login failed.',
    });
  }
});

router.post('/auth/logout', (_req, res) => {
  clearAdminCookie(res);
  res.json({ message: 'Logged out successfully.' });
});

router.put('/auth/password', requireAdminAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body as Record<string, unknown>;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      res.status(400).json({ error: 'Current and new passwords are required.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }

    const admin = await findAdminById(req.admin!.sub);
    if (!admin) {
      res.status(404).json({ error: 'Admin account not found.' });
      return;
    }

    const matches = await bcrypt.compare(currentPassword, admin.password);
    if (!matches) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    await updateAdminPassword(admin._id, newPassword);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Could not update password.',
    });
  }
});

// ---------------- DASHBOARD & ANALYTICS ----------------

router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    const data = await getDashboardAnalytics({ from, to });
    res.json({
      ...data,
      system: {
        databaseMode: isMongoConnected() ? 'MongoDB (Mongoose)' : 'Local Persistent Store',
        mediaMode: isCloudinaryConfigured() ? 'Cloudinary CDN' : 'Local Secure Storage',
      },
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to compute analytics.',
    });
  }
});

// ---------------- PLOT MANAGEMENT ----------------

router.get('/plots', requireAdminAuth, async (req, res) => {
  try {
    const result = await queryPlots({
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      block: typeof req.query.block === 'string' ? req.query.block : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      page: typeof req.query.page === 'string' ? Number(req.query.page) : 1,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : 50,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to fetch plots.',
    });
  }
});

router.post(
  '/plots',
  requireAdminAuth,
  plotImageUpload.array('images', 8),
  async (req, res) => {
    try {
      const {
        title,
        plotNumber,
        lengthFt,
        widthFt,
        block,
        category,
        price,
        description,
        features,
        status,
        facing,
      } = req.body as Record<string, unknown>;

      if (typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'Plot title is required.' });
        return;
      }
      if (typeof plotNumber !== 'string' || !plotNumber.trim()) {
        res.status(400).json({ error: 'Plot number is required.' });
        return;
      }
      const numericLength = Number(lengthFt);
      const numericWidth = Number(widthFt);
      if (!Number.isFinite(numericLength) || numericLength <= 0) {
        res.status(400).json({ error: 'Valid plot length (in feet) is required.' });
        return;
      }
      if (!Number.isFinite(numericWidth) || numericWidth <= 0) {
        res.status(400).json({ error: 'Valid plot width (in feet) is required.' });
        return;
      }
      if (typeof block !== 'string' || !block.trim()) {
        res.status(400).json({ error: 'Block name is required.' });
        return;
      }
      if (
        typeof category !== 'string' ||
        !VALID_CATEGORIES.includes(category as PlotCategory)
      ) {
        res.status(400).json({ error: 'Valid plot category is required.' });
        return;
      }

      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        res.status(400).json({ error: 'Valid positive price is required.' });
        return;
      }
      if (typeof description !== 'string' || !description.trim()) {
        res.status(400).json({ error: 'Plot description is required.' });
        return;
      }

      const plotStatus: PlotStatus =
        typeof status === 'string' && VALID_PLOT_STATUSES.includes(status as PlotStatus)
          ? (status as PlotStatus)
          : 'Available';

      const files = (req.files as Express.Multer.File[]) || [];
      const uploadedImages = await Promise.all(
        files.map((file) => uploadPlotImage(file.buffer, file.mimetype))
      );

      const created = await createPlot({
        title: title.trim(),
        plotNumber: plotNumber.trim().toUpperCase(),
        lengthFt: numericLength,
        widthFt: numericWidth,
        block: block.trim(),
        category: category as PlotCategory,
        price: numericPrice,
        description: description.trim(),
        features: parseFeatures(features),
        facing: typeof facing === 'string' ? facing.trim() : '',
        images: uploadedImages,
        status: plotStatus,
      });

      res.status(201).json({ plot: created });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Failed to create plot.',
      });
    }
  }
);

router.put(
  '/plots/:id',
  requireAdminAuth,
  plotImageUpload.array('images', 8),
  async (req, res) => {
    try {
      const existing = await getPlotById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Plot not found.' });
        return;
      }

      const {
        title,
        plotNumber,
        lengthFt,
        widthFt,
        block,
        category,
        price,
        description,
        features,
        status,
        facing,
        retainedImages,
      } = req.body as Record<string, unknown>;

      let nextImages = [...existing.images];

      if (typeof retainedImages === 'string') {
        try {
          const keepList = JSON.parse(retainedImages) as {
            url: string;
            publicId: string;
          }[];
          const keepIds = new Set(keepList.map((img) => img.publicId));
          const removed = existing.images.filter((img) => !keepIds.has(img.publicId));
          await Promise.all(removed.map((img) => deletePlotImage(img.publicId)));
          nextImages = existing.images.filter((img) => keepIds.has(img.publicId));
        } catch {
          // ignore malformed retainedImages
        }
      }

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length > 0) {
        const uploaded = await Promise.all(
          files.map((file) => uploadPlotImage(file.buffer, file.mimetype))
        );
        nextImages = [...nextImages, ...uploaded];
      }

      const updates: Parameters<typeof updatePlot>[1] = {
        images: nextImages,
      };

      if (typeof title === 'string' && title.trim()) updates.title = title.trim();
      if (typeof plotNumber === 'string' && plotNumber.trim())
        updates.plotNumber = plotNumber.trim().toUpperCase();
      if (lengthFt !== undefined) {
        const numericLength = Number(lengthFt);
        if (!Number.isFinite(numericLength) || numericLength <= 0) {
          res.status(400).json({ error: 'Valid positive length (ft) is required.' });
          return;
        }
        updates.lengthFt = numericLength;
      }
      if (widthFt !== undefined) {
        const numericWidth = Number(widthFt);
        if (!Number.isFinite(numericWidth) || numericWidth <= 0) {
          res.status(400).json({ error: 'Valid positive width (ft) is required.' });
          return;
        }
        updates.widthFt = numericWidth;
      }
      if (typeof block === 'string' && block.trim()) updates.block = block.trim();
      if (
        typeof category === 'string' &&
        VALID_CATEGORIES.includes(category as PlotCategory)
      ) {
        updates.category = category as PlotCategory;
      }
      if (price !== undefined) {
        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
          res.status(400).json({ error: 'Valid positive price is required.' });
          return;
        }
        updates.price = numericPrice;
      }
      if (typeof description === 'string' && description.trim()) {
        updates.description = description.trim();
      }
      if (features !== undefined) {
        updates.features = parseFeatures(features);
      }
      if (typeof facing === 'string') updates.facing = facing.trim();
      if (
        typeof status === 'string' &&
        VALID_PLOT_STATUSES.includes(status as PlotStatus)
      ) {
        updates.status = status as PlotStatus;
      }

      const updated = await updatePlot(req.params.id, updates);
      res.json({ plot: updated });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Failed to update plot.',
      });
    }
  }
);

router.delete('/plots/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await deletePlot(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Plot not found.' });
      return;
    }
    await Promise.all(deleted.images.map((img) => deletePlotImage(img.publicId)));
    res.json({ message: 'Plot deleted successfully.', id: deleted._id });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to delete plot.',
    });
  }
});

// ---------------- ORDER MANAGEMENT ----------------

router.get('/orders', requireAdminAuth, async (req, res) => {
  try {
    const orders = await listOrders({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load orders.',
    });
  }
});

router.patch('/orders/:id', requireAdminAuth, async (req, res) => {
  try {
    const { status, internalNotes, confirmedSalePrice } = req.body as Record<
      string,
      unknown
    >;

    if (
      status !== undefined &&
      (typeof status !== 'string' ||
        !VALID_ORDER_STATUSES.includes(status as OrderStatus))
    ) {
      res.status(400).json({ error: 'Invalid order status.' });
      return;
    }

    const updated = await updateOrderByAdmin(req.params.id, {
      status: status as OrderStatus | undefined,
      internalNotes: typeof internalNotes === 'string' ? internalNotes : undefined,
      confirmedSalePrice:
        confirmedSalePrice !== undefined && Number.isFinite(Number(confirmedSalePrice))
          ? Number(confirmedSalePrice)
          : undefined,
    });

    if (!updated) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    res.json({ order: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update order.';
    res.status(msg.includes('already') ? 409 : 400).json({ error: msg });
  }
});

// ---------------- PAYMENT RECORDS ----------------

router.get('/payments', requireAdminAuth, async (_req, res) => {
  try {
    const payments = await listPayments();
    res.json({ payments });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load payments.',
    });
  }
});

router.post('/payments', requireAdminAuth, async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, referenceNumber, paymentDate } =
      req.body as Record<string, unknown>;

    if (typeof orderId !== 'string' || !orderId.trim()) {
      res.status(400).json({ error: 'Order ID is required.' });
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required.' });
      return;
    }
    if (typeof paymentMethod !== 'string' || !paymentMethod.trim()) {
      res.status(400).json({ error: 'Payment method is required.' });
      return;
    }
    if (typeof referenceNumber !== 'string' || !referenceNumber.trim()) {
      res.status(400).json({ error: 'Reference number is required.' });
      return;
    }

    const payment = await createPaymentRecord({
      orderId: orderId.trim(),
      amount: numericAmount,
      paymentMethod: paymentMethod.trim(),
      referenceNumber: referenceNumber.trim(),
      paymentDate: typeof paymentDate === 'string' ? paymentDate : undefined,
      paymentStatus: 'Completed',
    });

    res.status(201).json({ payment });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Failed to record payment.',
    });
  }
});

export default router;
