import { Request, Response } from 'express';
import { z } from 'zod';
import * as QuestionModel from '../models/question.model';

// Zod Schemas
const questionCreateSchema = z.object({
	front: z.string().min(1, 'Front is required'),
	back: z.string().min(1, 'Back is required'),
	deckId: z.number().int().positive('Deck ID must be a positive integer'),
	parentId: z.number().int().positive().nullable().optional(),
	imagePath: z.string().optional(),
});

const questionUpdateSchema = z.object({
	front: z.string().min(1).optional(),
	back: z.string().min(1).optional(),
	deckId: z.number().int().positive().optional(),
	parentId: z.number().int().positive().nullable().optional(),
	imagePath: z.string().optional(),
});

// POST - Create Question
export const createQuestionController = async (req: Request, res: Response) => {
	try {
		// Get imagePath from uploaded file or body
		const imagePath = req.file
			? `/uploads/questions/${req.file.filename}`
			: req.body.imagePath || '';

		const parsed = questionCreateSchema.parse({
			...req.body,
			deckId: parseInt(req.body.deckId, 10),
			parentId: req.body.parentId
				? parseInt(req.body.parentId, 10)
				: null,
			imagePath,
		});

		const question = await QuestionModel.createQuestion(
			parsed.front,
			parsed.back,
			parsed.deckId,
			parsed.parentId ?? null,
			parsed.imagePath || ''
		);
		res.status(201).json(question);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error });
		}
		console.error('Error creating question:', error);
		res.status(500).json({ error: 'Failed to create question' });
	}
};

// PATCH - Update Question
export const updateQuestionController = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid question ID' });
		}

		// Get imagePath from uploaded file or body
		const imagePath = req.file
			? `/uploads/questions/${req.file.filename}`
			: req.body.imagePath;

		const parsed = questionUpdateSchema.parse({
			...req.body,
			deckId: req.body.deckId ? parseInt(req.body.deckId, 10) : undefined,
			parentId: req.body.parentId
				? parseInt(req.body.parentId, 10)
				: undefined,
			imagePath,
		});

		const question = await QuestionModel.updateQuestion(
			id,
			parsed.front,
			parsed.back,
			parsed.deckId,
			parsed.parentId,
			parsed.imagePath
		);

		if (!question) {
			return res.status(404).json({ error: 'Question not found' });
		}

		res.json(question);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error });
		}
		console.error('Error updating question:', error);
		res.status(500).json({ error: 'Failed to update question' });
	}
};

// DELETE - Delete Question
export const deleteQuestionController = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid question ID' });
		}

		const question = await QuestionModel.deleteQuestion(id);

		if (!question) {
			return res.status(404).json({ error: 'Question not found' });
		}

		res.json(question);
	} catch (error) {
		console.error('Error deleting question:', error);
		res.status(500).json({ error: 'Failed to delete question' });
	}
};

// GET - Get Question by ID
export const getQuestionByIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid question ID' });
		}

		const question = await QuestionModel.getQuestionById(id);

		if (!question) {
			return res.status(404).json({ error: 'Question not found' });
		}

		res.json(question);
	} catch (error) {
		console.error('Error fetching question:', error);
		res.status(500).json({ error: 'Failed to fetch question' });
	}
};

// GET - Get all Questions
export const getAllQuestionsController = async (
	req: Request,
	res: Response
) => {
	try {
		const questions = await QuestionModel.getAllQuestions();
		res.json(questions);
	} catch (error) {
		console.error('Error fetching questions:', error);
		res.status(500).json({ error: 'Failed to fetch questions' });
	}
};

// GET - Get Questions by Deck ID
export const getQuestionsByDeckIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const deckId = parseInt(req.query.deckId as string, 10);
		if (isNaN(deckId)) {
			return res.status(400).json({ error: 'Invalid deck ID' });
		}

		const questions = await QuestionModel.getQuestionsByDeckId(deckId);
		res.json(questions);
	} catch (error) {
		console.error('Error fetching questions by deck:', error);
		res.status(500).json({ error: 'Failed to fetch questions by deck' });
	}
};

// GET - Get Sub-questions by Parent ID
export const getSubQuestionsByParentIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const parentId = parseInt(req.params.parentId, 10);
		if (isNaN(parentId)) {
			return res.status(400).json({ error: 'Invalid parent ID' });
		}

		const subQuestions =
			await QuestionModel.getSubQuestionsByParentId(parentId);
		res.json(subQuestions);
	} catch (error) {
		console.error('Error fetching sub-questions:', error);
		res.status(500).json({ error: 'Failed to fetch sub-questions' });
	}
};
