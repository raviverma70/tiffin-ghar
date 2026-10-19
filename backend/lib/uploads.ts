import fs from "node:fs";
import path from "node:path";

// backend folder me "uploads" (npm run dev backend folder se chalta hai)
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });