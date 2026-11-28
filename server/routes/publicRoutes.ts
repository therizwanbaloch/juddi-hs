import { Router } from 'express';
import {
  createBookingOrder,
  getPlotById,
  queryPlots,
} from '../services/dataStore.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return undefined;
}

router.get('/plots', async (req, res) => {
  try {
    const result = await queryPlots({
      category: asOptionalString(req.query.category),
      size: asOptionalString(req.query.size),
      dimensions: asOptionalString(req.query.dimensions),
      block: asOptionalString(req.query.block),
      status: asOptionalString(req.query.status),
      minPrice: asOptionalNumber(req.query.minPrice),
      maxPrice: asOptionalNumber(req.query.maxPrice),
      minArea: asOptionalNumber(req.query.minArea),
      maxArea: asOptionalNumber(req.query.maxArea),
      search: asOptionalString(req.query.search),
      page: asOptionalNumber(req.query.page),
      limit: asOptionalNumber(req.query.limit),
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load plots.',
    });
  }
});

router.get('/plots/:id', async (req, res) => {
  try {
    const plot = await getPlotById(req.params.id);
    if (!plot) {
      res.status(404).json({ error: 'Plot not found.' });
      return;
    }
    res.json({ plot });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to fetch plot details.',
    });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { customerName, phone, email, plotId, message } = req.body as Record<
      string,
      unknown
    >;

    if (typeof customerName !== 'string' || customerName.trim().length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }
    if (typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
      res.status(400).json({ error: 'Please enter a valid phone number.' });
      return;
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (typeof plotId !== 'string' || !plotId.trim()) {
      res.status(400).json({ error: 'Please select a valid plot.' });
      return;
    }

    const order = await createBookingOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      plotId: plotId.trim(),
      message: typeof message === 'string' ? message.trim() : '',
    });

    res.status(201).json({
      message: 'Booking request submitted successfully.',
      order,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not submit booking request.';
    res.status(msg.includes('sold') || msg.includes('not found') ? 400 : 500).json({
      error: msg,
    });
  }
});

router.post('/contact', async (req, res) => {
  const { name, phone, email, subject, message } = req.body as Record<
    string,
    unknown
  >;

  if (typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  if (typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    res.status(400).json({ error: 'Valid phone number is required.' });
    return;
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }
  if (typeof message !== 'string' || message.trim().length < 5) {
    res.status(400).json({ error: 'Please enter your message.' });
    return;
  }

  res.status(201).json({
    message:
      'Thank you for contacting Juddi Housing Scheme Pasni. Our sales desk will reach out shortly.',
    inquiryRef: `INQ-${Date.now().toString().slice(-6)}`,
    subject: typeof subject === 'string' ? subject.trim() : 'General Inquiry',
  });
});

export default router;
