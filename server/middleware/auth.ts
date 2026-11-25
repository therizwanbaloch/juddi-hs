import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { env } from '../config/env.js';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminJwtPayload;
}

export const ADMIN_COOKIE_NAME = 'jhs_admin_token';

export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function setAdminCookie(res: Response, token: string): void {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    partitioned: true,
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAdminCookie(res: Response): void {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    partitioned: true,
    path: '/',
  });
}

export function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  let token = '';
  let usedCookie = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.cookies && typeof req.cookies[ADMIN_COOKIE_NAME] === 'string') {
    token = req.cookies[ADMIN_COOKIE_NAME];
    usedCookie = true;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  // CSRF defense when cookie-based auth is used on mutating endpoints
  if (usedCookie && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const requestedWith = req.headers['x-requested-with'];
    const origin = req.headers.origin;
    const host = (req.headers['x-forwarded-host'] || req.headers.host) as
      | string
      | undefined;

    const originMatchesHost =
      origin &&
      host &&
      (() => {
        try {
          return new URL(origin).host === host;
        } catch {
          return false;
        }
      })();

    if (requestedWith !== 'XMLHttpRequest' && !originMatchesHost) {
      res.status(403).json({ error: 'CSRF validation failed.' });
      return;
    }
  }

  const decoded = verifyAdminToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Session expired or invalid token.' });
    return;
  }

  req.admin = decoded;
  next();
}

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

export const plotImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 8,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WEBP image files are allowed.'));
    }
  },
});
