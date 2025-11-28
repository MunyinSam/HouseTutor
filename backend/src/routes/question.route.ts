import { Router } from 'express';
import {
	createQuestionController,
	getAllQuestionsController,
	getQuestionByIdController,
	updateQuestionController,
	deleteQuestionController,
} from '../controllers/question.model';

const router = Router();

// Admin/protected routes
router.post('/', createQuestionController);
router.get('/', getAllQuestionsController);
router.get('/:id', getQuestionByIdController);
router.patch('/:id', updateQuestionController);
router.delete('/:id', deleteQuestionController);

export default router;
