import { Router } from 'express';
import {
	createImageOcclusionController,
	updateImageOcclusionController,
	deleteImageOcclusionController,
	getImageOcclusionByIdController,
	getImageOcclusionsByDeckIdController,
	getAllImageOcclusionsController,
} from '../controllers/imageOcclusion.controller';
import { uploadOcclusion } from '../config/multer';

const router = Router();

// POST /api/v1/occlusion - Create a new image occlusion
router.post(
	'/',
	uploadOcclusion.single('image'),
	createImageOcclusionController
);

// GET /api/v1/occlusion - Get all image occlusions
router.get('/', getAllImageOcclusionsController);

// GET /api/v1/occlusion/deck?deckId=xxx - Get image occlusions by deck ID
router.get('/deck', getImageOcclusionsByDeckIdController);

// GET /api/v1/occlusion/:id - Get image occlusion by ID
router.get('/:id', getImageOcclusionByIdController);

// PATCH /api/v1/occlusion/:id - Update image occlusion
router.patch(
	'/:id',
	uploadOcclusion.single('image'),
	updateImageOcclusionController
);

// DELETE /api/v1/occlusion/:id - Delete image occlusion
router.delete('/:id', deleteImageOcclusionController);

export default router;
