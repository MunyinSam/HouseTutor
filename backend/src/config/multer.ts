import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/questions');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		// Generate unique filename with sanitization
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		// Sanitize the original name: remove special chars, spaces, keep only alphanumeric and dashes
		const originalName = path.basename(file.originalname, ext);
		const sanitizedName = originalName
			.replace(/[^a-zA-Z0-9]/g, '-')
			.replace(/-+/g, '-')
			.toLowerCase()
			.substring(0, 50); // Limit length
		cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
	},
});

// File filter - only allow images
const fileFilter = (
	req: any,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	const allowedMimes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/webp',
	];
	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
			)
		);
	}
};

// Export configured multer instance
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
});
