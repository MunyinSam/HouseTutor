import { Router } from 'express';
import {
	createReviewController,
	updateReviewController,
	deleteReviewController,
	getReviewByIdController,
	getReviewByUserAndFlashcardController,
	getReviewsByUserIdController,
	getReviewsByFlashcardIdController,
	getDueReviewsController,
} from '../controllers/review.controller';

const router = Router();

// POST /api/v1/review - Create or update a review (upsert)
router.post('/', createReviewController);

// GET /api/v1/review/due?userId=xxx - Get due reviews for user
router.get('/due', getDueReviewsController);

// GET /api/v1/review/user?userId=xxx - Get all reviews by user
router.get('/user', getReviewsByUserIdController);

// GET /api/v1/review/flashcard?flashcardId=xxx - Get all reviews by flashcard
router.get('/flashcard', getReviewsByFlashcardIdController);

// GET /api/v1/review/find?userId=xxx&flashcardId=yyy - Get specific review
router.get('/find', getReviewByUserAndFlashcardController);

// GET /api/v1/review/:id - Get review by ID
router.get('/:id', getReviewByIdController);

// PATCH /api/v1/review/:id - Update review (SM-2 progress)
router.patch('/:id', updateReviewController);

// DELETE /api/v1/review/:id - Delete review
router.delete('/:id', deleteReviewController);

export default router;
