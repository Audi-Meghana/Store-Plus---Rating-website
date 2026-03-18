/**
 * storageService.js
 * Saves uploaded files (from multer memoryStorage) to local disk.
 * Returns a relative URL like /uploads/shops/filename.jpg
 * that the frontend can use directly.
 */

import fs   from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "uploads");

// ── Ensure a directory exists ─────────────────────────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ── Upload a file buffer to disk ──────────────────────────────────────────────
// folder: "shops" | "reviews" | "avatars" | "covers" etc.
// Returns: "/uploads/shops/filename.jpg"
export const uploadFile = async (buffer, filename, mimetype, folder = "misc") => {
  const ext       = getExtension(mimetype, filename);
  const safeName  = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const uploadDir = path.join(BASE_DIR, folder);

  ensureDir(uploadDir);

  const filepath = path.join(uploadDir, safeName);
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${folder}/${safeName}`;
};

// ── Delete a file from disk ───────────────────────────────────────────────────
// fileUrl: "/uploads/shops/filename.jpg"
export const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  // Strip leading slash, build absolute path
  const relative = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
  const filepath  = path.join(process.cwd(), relative);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

// ── Move / rename a file ──────────────────────────────────────────────────────
export const moveFile = async (oldUrl, newFolder) => {
  if (!oldUrl) return oldUrl;

  const relative   = oldUrl.startsWith("/") ? oldUrl.slice(1) : oldUrl;
  const oldPath    = path.join(process.cwd(), relative);
  const filename   = path.basename(oldPath);
  const newDir     = path.join(BASE_DIR, newFolder);

  ensureDir(newDir);

  const newPath = path.join(newDir, filename);
  fs.renameSync(oldPath, newPath);

  return `/uploads/${newFolder}/${filename}`;
};

// ── Helper: get file extension from mimetype or filename ──────────────────────
const getExtension = (mimetype, filename = "") => {
  const mimeMap = {
    "image/jpeg": ".jpg",
    "image/jpg":  ".jpg",
    "image/png":  ".png",
    "image/webp": ".webp",
    "image/gif":  ".gif",
    "application/pdf": ".pdf",
  };
  if (mimeMap[mimetype]) return mimeMap[mimetype];

  // Fall back to original file extension
  const ext = path.extname(filename);
  return ext || ".bin";
};