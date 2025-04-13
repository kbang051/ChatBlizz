import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB limit
});

export default upload;