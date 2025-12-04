import { Router } from 'express';
import {
	createQuestionController,
	updateQuestionController,
	deleteQuestionController,
	getQuestionByIdController,
	getAllQuestionsController,
	getQuestionsByDeckIdController,
	getSubQuestionsByParentIdController,
} from '../controllers/question.controller';

const router = Router();

// POST /api/v1/question - Create a new question
router.post('/', createQuestionController);

// GET /api/v1/question - Get all questions
router.get('/', getAllQuestionsController);

// GET /api/v1/question/deck?deckId=xxx - Get questions by deck ID
router.get('/deck', getQuestionsByDeckIdController);

// GET /api/v1/question/:parentId/sub - Get sub-questions by parent ID
router.get('/:parentId/sub', getSubQuestionsByParentIdController);

// GET /api/v1/question/:id - Get question by ID
router.get('/:id', getQuestionByIdController);

// PATCH /api/v1/question/:id - Update question
router.patch('/:id', updateQuestionController);

// DELETE /api/v1/question/:id - Delete question
router.delete('/:id', deleteQuestionController);

export default router;
