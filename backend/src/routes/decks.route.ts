import { Router } from 'express';
import {
	createDeckController,
	updateDeckController,
	deleteDeckController,
	getDeckByIdController,
	getAllDecksController,
	getDecksByOwnerIdController,
	getDecksByCategoryController,
	updateDeckPublicController,
	updateDeckPrivateController,
} from '../controllers/decks.controller';

const router = Router();

// POST /api/v1/decks - Create a new deck
router.post('/', createDeckController);

// GET /api/v1/decks - Get all decks
router.get('/', getAllDecksController);

// GET /api/v1/decks/owner?ownerId=xxx - Get decks by owner
router.get('/owner', getDecksByOwnerIdController);

// GET /api/v1/decks/category?category=xxx - Get decks by category
router.get('/category', getDecksByCategoryController);

// GET /api/v1/decks/:id - Get deck by ID
router.get('/:id', getDeckByIdController);

// PATCH /api/v1/decks/:id - Update deck
router.patch('/:id', updateDeckController);

// DELETE /api/v1/decks/:id - Delete deck
router.delete('/:id', deleteDeckController);

// PATCH
router.patch('/public/:id', updateDeckPublicController);

// PATCH
router.patch('/private/:id', updateDeckPrivateController);

export default router;
