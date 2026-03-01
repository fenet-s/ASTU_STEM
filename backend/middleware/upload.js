const multer = require('multer');
const path = require('path');

// Multer config for image upload
module.exports = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"];
        if (!allowedExts.includes(ext)) {
            cb(new Error("File type is not supported. Please upload images, PDFs, or Documents."), false);
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
