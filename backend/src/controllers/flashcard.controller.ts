import { Request, Response } from 'express';
import { z } from 'zod';
import * as FlashcardModel from '../models/flashcard.model';

// Zod Schemas
const flashcardCreateSchema = z.object({
	questionId: z
		.number()
		.int()
		.positive('Question ID must be a positive integer'),
});

// POST - Create Flashcard
export const createFlashcardController = async (
	req: Request,
	res: Response
) => {
	try {
		const parsed = flashcardCreateSchema.parse(req.body);
		const flashcard = await FlashcardModel.createFlashcard(
			parsed.questionId
		);
		res.status(201).json(flashcard);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error });
		}
		console.error('Error creating flashcard:', error);
		res.status(500).json({ error: 'Failed to create flashcard' });
	}
};

// DELETE - Delete Flashcard
export const deleteFlashcardController = async (
	req: Request,
	res: Response
) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid flashcard ID' });
		}

		const flashcard = await FlashcardModel.deleteFlashcard(id);

		if (!flashcard) {
			return res.status(404).json({ error: 'Flashcard not found' });
		}

		res.json(flashcard);
	} catch (error) {
		console.error('Error deleting flashcard:', error);
		res.status(500).json({ error: 'Failed to delete flashcard' });
	}
};

// GET - Get Flashcard by ID
export const getFlashcardByIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid flashcard ID' });
		}

		const flashcard = await FlashcardModel.getFlashcardById(id);

		if (!flashcard) {
			return res.status(404).json({ error: 'Flashcard not found' });
		}

		res.json(flashcard);
	} catch (error) {
		console.error('Error fetching flashcard:', error);
		res.status(500).json({ error: 'Failed to fetch flashcard' });
	}
};

// GET - Get Flashcard by Question ID
export const getFlashcardByQuestionIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const questionId = parseInt(req.query.questionId as string, 10);
		if (isNaN(questionId)) {
			return res.status(400).json({ error: 'Invalid question ID' });
		}

		const flashcard =
			await FlashcardModel.getFlashcardByQuestionId(questionId);

		if (!flashcard) {
			return res.status(404).json({ error: 'Flashcard not found' });
		}

		res.json(flashcard);
	} catch (error) {
		console.error('Error fetching flashcard by question:', error);
		res.status(500).json({
			error: 'Failed to fetch flashcard by question',
		});
	}
};

// GET - Get all Flashcards
export const getAllFlashcardsController = async (
	req: Request,
	res: Response
) => {
	try {
		const flashcards = await FlashcardModel.getAllFlashcards();
		res.json(flashcards);
	} catch (error) {
		console.error('Error fetching flashcards:', error);
		res.status(500).json({ error: 'Failed to fetch flashcards' });
	}
};
