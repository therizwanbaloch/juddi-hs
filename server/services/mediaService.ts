import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from '../config/env.js';

export interface UploadedImage {
  url: string;
  publicId: string;
}

const UPLOAD_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'uploads', 'plots')
  : path.resolve(process.cwd(), 'uploads', 'plots');

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadPlotImage(
  buffer: Buffer,
  mimetype: string
): Promise<UploadedImage> {
  const ext = MIME_TO_EXT[mimetype.toLowerCase()];
  if (!ext) {
    throw new Error('Unsupported image format. Only JPEG, PNG, and WEBP are allowed.');
  }

  if (isCloudinaryConfigured()) {
    return new Promise<UploadedImage>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'juddi-housing-scheme/plots',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  ensureUploadDir();
  const filename = `plot_${crypto.randomBytes(12).toString('hex')}${ext}`;
  const targetPath = path.resolve(UPLOAD_DIR, filename);

  if (!targetPath.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error('Invalid upload target path');
  }

  await fs.promises.writeFile(targetPath, buffer);
  return {
    url: `/uploads/plots/${filename}`,
    publicId: `local:${filename}`,
  };
}

export async function deletePlotImage(publicId: string): Promise<void> {
  if (!publicId || publicId.startsWith('seed:')) {
    return;
  }

  if (publicId.startsWith('local:')) {
    const filename = path.basename(publicId.replace('local:', ''));
    const targetPath = path.resolve(UPLOAD_DIR, filename);
    if (
      targetPath.startsWith(UPLOAD_DIR + path.sep) &&
      fs.existsSync(targetPath)
    ) {
      await fs.promises.unlink(targetPath).catch(() => undefined);
    }
    return;
  }

  if (isCloudinaryConfigured()) {
    await cloudinary.uploader.destroy(publicId).catch(() => undefined);
  }
}
