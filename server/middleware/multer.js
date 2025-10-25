import multer from "multer";

// ✅ Store files in memory (buffer available in req.file.buffer)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
