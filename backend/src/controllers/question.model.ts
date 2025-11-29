import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
	createQuestion,
	updateQuestion,
	deleteQuestion,
	getQuestionById,
	getAllQuestions,
	getQuestionsByTopicIds,
	incrementPriority,
	decrementPriority,
} from '../models/question.model';

const questionIdSchema = z.object({ id: z.string().uuid() });
const questionCreateSchema = z.object({
	question: z.string(),
	answer: z.string(),
	topicId: z.number(),
});

export const createQuestionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { question, answer, topicId } = questionCreateSchema.parse(
			req.body
		);
		const created = await createQuestion(question, answer, topicId);
		return res.status(201).json(created);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid question data' });
		}
		next(err);
	}
};

export const updateQuestionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = questionIdSchema.parse(req.params);
		const { question, answer, topicId } = questionCreateSchema.parse(
			req.body
		);
		const updated = await updateQuestion(id, question, answer, topicId);
		if (!updated) {
			return res.status(404).json({ message: 'Question not found' });
		}
		return res.status(200).json(updated);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid question data' });
		}
		next(err);
	}
};

export const deleteQuestionController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = questionIdSchema.parse(req.params);
		const deleted = await deleteQuestion(id);
		if (!deleted) {
			return res.status(404).json({ message: 'Question not found' });
		}
		return res.status(200).json(deleted);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid question id' });
		}
		next(err);
	}
};

export const getQuestionByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = questionIdSchema.parse(req.params);
		const question = await getQuestionById(id);
		if (!question) {
			return res.status(404).json({ message: 'Question not found' });
		}
		return res.status(200).json(question);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid question id' });
		}
		next(err);
	}
};

export const getAllQuestionsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const questions = await getAllQuestions();
		return res.status(200).json(questions);
	} catch (err) {
		next(err);
	}
};

// Get questions by multiple topic IDs
const topicIdsSchema = z.object({ topicIds: z.array(z.number()) });

export const getQuestionsByTopicIdsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Accept topicIds from body (POST) or query (GET)
		let topicIds: number[] = [];
		if (req.method === 'GET') {
			// e.g. /api/v1/question/by-topic?topicIds=1,2,3
			const ids = req.query.topicIds;
			if (typeof ids === 'string') {
				topicIds = ids
					.split(',')
					.map(Number)
					.filter((n) => !isNaN(n));
			} else if (Array.isArray(ids)) {
				topicIds = ids.map(Number).filter((n) => !isNaN(n));
			}
		} else {
			const parsed = topicIdsSchema.safeParse(req.body);
			if (!parsed.success) {
				return res.status(400).json({ message: 'Invalid topicIds' });
			}
			topicIds = parsed.data.topicIds;
		}
		if (!topicIds.length) {
			return res.status(400).json({ message: 'No topicIds provided' });
		}
		// You need to implement this function in your model
		const questions = await getQuestionsByTopicIds(topicIds);
		return res.status(200).json(questions);
	} catch (err) {
		next(err);
	}
};

export const incrementPriorityController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = Number(req.params.id);
		const updated = await incrementPriority(id);
		if (!updated)
			return res.status(404).json({ message: 'Question not found' });
		return res.json(updated);
	} catch (err) {
		next(err);
	}
};

export const decrementPriorityController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = Number(req.params.id);
		const updated = await decrementPriority(id);
		if (!updated)
			return res.status(404).json({ message: 'Question not found' });
		return res.json(updated);
	} catch (err) {
		next(err);
	}
};
