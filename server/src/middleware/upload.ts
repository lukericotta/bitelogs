import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { Request } from 'express';
import { config } from '../config';
import { BadRequestError } from '../utils/errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 80;

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only JPEG, PNG, and WebP images are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
});

export const processImage = async (
  buffer: Buffer,
  filename: string
): Promise<{ buffer: Buffer; filename: string }> => {
  const processed = await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toBuffer();

  const newFilename = `${path.parse(filename).name}-${Date.now()}.webp`;

  return { buffer: processed, filename: newFilename };
};

export const saveImageLocally = async (
  buffer: Buffer,
  filename: string
): Promise<string> => {
  const fs = await import('fs/promises');
  const uploadPath = path.join(config.UPLOAD_DIR, filename);
  
  await fs.mkdir(config.UPLOAD_DIR, { recursive: true });
  await fs.writeFile(uploadPath, buffer);
  
  return `/uploads/${filename}`;
};
