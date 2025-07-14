import multer from "multer";
import path from "path";
import fs from "fs";

// Absolute path: /app/uploads (shared Docker volume)
const uploadPath = path.join(__dirname, "..", "uploads");

// ✅ Ensure uploads directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Storage engine for Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname); // e.g. ".jpg"
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ Export Multer middleware
export const upload = multer({ storage });
