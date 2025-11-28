import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
	createQuestion,
	updateQuestion,
	deleteQuestion,
	getQuestionById,
	getAllQuestions,
} from '../models/question.model';

const questionIdSchema = z.object({ id: z.string().uuid() });
const questionCreateSchema = z.object({
	question: z.string(),
	answer: z.string(),
	topicId: z.string().uuid(),
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
