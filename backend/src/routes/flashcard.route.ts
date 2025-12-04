import { Router } from 'express';
import {
	createFlashcardController,
	deleteFlashcardController,
	getFlashcardByIdController,
	getFlashcardByQuestionIdController,
	getAllFlashcardsController,
} from '../controllers/flashcard.controller';

const router = Router();

// POST /api/v1/flashcard - Create a new flashcard
router.post('/', createFlashcardController);

// GET /api/v1/flashcard - Get all flashcards
router.get('/', getAllFlashcardsController);

// GET /api/v1/flashcard/question?questionId=xxx - Get flashcard by question ID
router.get('/question', getFlashcardByQuestionIdController);

// GET /api/v1/flashcard/:id - Get flashcard by ID
router.get('/:id', getFlashcardByIdController);

// DELETE /api/v1/flashcard/:id - Delete flashcard
router.delete('/:id', deleteFlashcardController);

export default router;
