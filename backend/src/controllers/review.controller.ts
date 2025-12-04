import { Request, Response } from 'express';
import { z } from 'zod';
import * as ReviewModel from '../models/review.model';

// Zod Schemas
const reviewCreateSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	flashcardId: z
		.number()
		.int()
		.positive('Flashcard ID must be a positive integer'),
	easinessFactor: z.number().min(1.3).max(2.5).optional(),
	interval: z.number().int().min(0).optional(),
	consecutiveCorrect: z.number().int().min(0).optional(),
	nextReviewDate: z.string().datetime().optional(),
});

const reviewUpdateSchema = z.object({
	easinessFactor: z.number().min(1.3).max(2.5).optional(),
	interval: z.number().int().min(0).optional(),
	consecutiveCorrect: z.number().int().min(0).optional(),
	nextReviewDate: z.string().datetime().optional(),
});

// POST - Create or Update Review
export const createReviewController = async (req: Request, res: Response) => {
	try {
		const parsed = reviewCreateSchema.parse(req.body);
		const review = await ReviewModel.createReview(
			parsed.userId,
			parsed.flashcardId,
			parsed.easinessFactor,
			parsed.interval,
			parsed.consecutiveCorrect,
			parsed.nextReviewDate ? new Date(parsed.nextReviewDate) : undefined
		);
		res.status(201).json(review);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error });
		}
		console.error('Error creating review:', error);
		res.status(500).json({ error: 'Failed to create review' });
	}
};

// PATCH - Update Review
export const updateReviewController = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid review ID' });
		}

		const parsed = reviewUpdateSchema.parse(req.body);
		const review = await ReviewModel.updateReview(
			id,
			parsed.easinessFactor,
			parsed.interval,
			parsed.consecutiveCorrect,
			parsed.nextReviewDate ? new Date(parsed.nextReviewDate) : undefined
		);

		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}

		res.json(review);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error });
		}
		console.error('Error updating review:', error);
		res.status(500).json({ error: 'Failed to update review' });
	}
};

// DELETE - Delete Review
export const deleteReviewController = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid review ID' });
		}

		const review = await ReviewModel.deleteReview(id);

		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}

		res.json(review);
	} catch (error) {
		console.error('Error deleting review:', error);
		res.status(500).json({ error: 'Failed to delete review' });
	}
};

// GET - Get Review by ID
export const getReviewByIdController = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res.status(400).json({ error: 'Invalid review ID' });
		}

		const review = await ReviewModel.getReviewById(id);

		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}

		res.json(review);
	} catch (error) {
		console.error('Error fetching review:', error);
		res.status(500).json({ error: 'Failed to fetch review' });
	}
};

// GET - Get Review by User and Flashcard
export const getReviewByUserAndFlashcardController = async (
	req: Request,
	res: Response
) => {
	try {
		const userId = req.query.userId as string;
		const flashcardId = parseInt(req.query.flashcardId as string, 10);

		if (!userId || isNaN(flashcardId)) {
			return res
				.status(400)
				.json({ error: 'Invalid user ID or flashcard ID' });
		}

		const review = await ReviewModel.getReviewByUserAndFlashcard(
			userId,
			flashcardId
		);

		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}

		res.json(review);
	} catch (error) {
		console.error('Error fetching review:', error);
		res.status(500).json({ error: 'Failed to fetch review' });
	}
};

// GET - Get all Reviews by User ID
export const getReviewsByUserIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const userId = req.query.userId as string;
		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}

		const reviews = await ReviewModel.getReviewsByUserId(userId);
		res.json(reviews);
	} catch (error) {
		console.error('Error fetching reviews by user:', error);
		res.status(500).json({ error: 'Failed to fetch reviews by user' });
	}
};

// GET - Get all Reviews by Flashcard ID
export const getReviewsByFlashcardIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const flashcardId = parseInt(req.query.flashcardId as string, 10);
		if (isNaN(flashcardId)) {
			return res.status(400).json({ error: 'Invalid flashcard ID' });
		}

		const reviews = await ReviewModel.getReviewsByFlashcardId(flashcardId);
		res.json(reviews);
	} catch (error) {
		console.error('Error fetching reviews by flashcard:', error);
		res.status(500).json({ error: 'Failed to fetch reviews by flashcard' });
	}
};

// GET - Get Due Reviews for User
export const getDueReviewsController = async (req: Request, res: Response) => {
	try {
		const userId = req.query.userId as string;
		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}

		const reviews = await ReviewModel.getDueReviews(userId);
		res.json(reviews);
	} catch (error) {
		console.error('Error fetching due reviews:', error);
		res.status(500).json({ error: 'Failed to fetch due reviews' });
	}
};
