import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Use absolute path for uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads', 'questions');

// Ensure uploads directory exists with better error handling
try {
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, { recursive: true });
		console.log(`Created uploads directory: ${uploadsDir}`);
	} else {
		console.log(`Uploads directory exists: ${uploadsDir}`);
	}
} catch (error) {
	console.error('Error creating uploads directory:', error);
}

// Configure storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log(`Saving file to: ${uploadsDir}`);
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		// Generate unique filename with sanitization
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const originalName = path.basename(file.originalname, ext);
		const sanitizedName = originalName
			.replace(/[^a-zA-Z0-9]/g, '-')
			.replace(/-+/g, '-')
			.toLowerCase()
			.substring(0, 50);
		const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
		console.log(`Generated filename: ${filename}`);
		cb(null, filename);
	},
});

// File filter - only allow images
const fileFilter = (
	req: Request,
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

// Occlusion uploads directory
const occlusionUploadsDir = path.join(process.cwd(), 'uploads', 'occlusions');

try {
	if (!fs.existsSync(occlusionUploadsDir)) {
		fs.mkdirSync(occlusionUploadsDir, { recursive: true });
		console.log(
			`Created occlusion uploads directory: ${occlusionUploadsDir}`
		);
	}
} catch (error) {
	console.error('Error creating occlusion uploads directory:', error);
}

// Configure storage for occlusions
const occlusionStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, occlusionUploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const originalName = path.basename(file.originalname, ext);
		const sanitizedName = originalName
			.replace(/[^a-zA-Z0-9]/g, '-')
			.replace(/-+/g, '-')
			.toLowerCase()
			.substring(0, 50);
		const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
		cb(null, filename);
	},
});

// Export occlusion multer instance
export const uploadOcclusion = multer({
	storage: occlusionStorage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit for occlusion images
	},
});
