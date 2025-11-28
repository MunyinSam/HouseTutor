import { Router } from 'express';
import {
	createTopicController,
	getAllTopicsController,
	getTopicByIdController,
	updateTopicController,
	deleteTopicController,
} from '../controllers/topic.model';

const router = Router();

router.post('/', createTopicController);
router.get('/', getAllTopicsController);
router.get('/:id', getTopicByIdController);
router.patch('/:id', updateTopicController);
router.delete('/:id', deleteTopicController);

export default router;
