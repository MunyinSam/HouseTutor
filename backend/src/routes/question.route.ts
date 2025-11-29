import { Router } from 'express';
import {
	createQuestionController,
	getAllQuestionsController,
	getQuestionByIdController,
	updateQuestionController,
	deleteQuestionController,
	getQuestionsByTopicIdsController,
	incrementPriorityController,
	decrementPriorityController,
} from '../controllers/question.model';

const router = Router();

// Admin/protected routes
router.post('/', createQuestionController);
router.get('/', getAllQuestionsController);
router.get('/by-topic', getQuestionsByTopicIdsController); // GET /api/v1/question/by-topic?topicIds=1,2,3
router.get('/:id', getQuestionByIdController);
router.patch('/:id', updateQuestionController);
router.delete('/:id', deleteQuestionController);
router.patch('/:id/increment-priority', incrementPriorityController);
router.patch('/:id/decrement-priority', decrementPriorityController);

export default router;
