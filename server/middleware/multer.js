import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

export const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "sponsorDocuments", maxCount: 10 },
]);

export default upload;
