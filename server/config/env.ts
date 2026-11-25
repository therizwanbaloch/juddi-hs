import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const runtimeJwtSecret = process.env.JWT_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI?.trim() || '',
  jwtSecret: runtimeJwtSecret,
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || '',
  adminPassword: process.env.ADMIN_PASSWORD?.trim() || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY?.trim() || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || '',
};

export const isCloudinaryConfigured = (): boolean =>
  Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
