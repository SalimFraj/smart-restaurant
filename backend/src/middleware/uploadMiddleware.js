import multer from 'multer';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to only accept image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'), false);
    }
};

// Configure multer with storage, file size limit, and file filter
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter,
});

export default upload;
