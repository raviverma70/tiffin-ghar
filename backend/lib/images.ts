import express, { type NextFunction, type Request, type Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { UPLOAD_DIR } from "./uploads.js";

const rawImage = express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "2mb" });

export const BAD_IMAGE = "Ye photo sahi nahi hai. JPG, PNG ya WebP bhejo";

// Photo ka raw data padho (2 MB tak, sirf JPG/PNG/WebP content-type)
export function readImage(req: Request, res: Response, next: NextFunction) {
  rawImage(req, res, (err?: unknown) => {
    if (err) {
      return res.status(413).json({ error: "Photo 2 MB se chhoti rakho (JPG, PNG ya WebP)" });
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Sirf JPG, PNG ya WebP photo bhejo" });
    }
    next();
  });
}

// Asli file ke shuru ke bytes dekhte hain, naam ya type par bharosa nahi
function detectExt(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf.length > 12 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function saveImage(buf: Buffer): Promise<string | null> {
  const ext = detectExt(buf);
  if (!ext) return null;
  const name = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf, { flag: "wx" });
  return `/uploads/${name}`;
}

export async function removeFile(url: string | null) {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
    // file pehle se nahi hai to koi baat nahi
  }
}
