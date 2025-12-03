import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
	createDeck,
	updateDeck,
	deleteDeck,
	getDeckById,
	getAllDecks,
	getDecksByOwnerId,
	getDecksByCategory,
} from '../models/decks.model';

const deckIdSchema = z.object({ id: z.string() });
const deckCreateSchema = z.object({
	title: z.string(),
	description: z.string().nullable().optional(),
	category: z.string(),
	ownerId: z.string(),
});
const deckUpdateSchema = z.object({
	title: z.string().optional(),
	description: z.string().nullable().optional(),
	category: z.string().optional(),
});

export const createDeckController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { title, description, category, ownerId } =
			deckCreateSchema.parse(req.body);
		const created = await createDeck(
			title,
			description ?? null,
			category,
			ownerId
		);
		return res.status(201).json(created);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid deck data' });
		}
		next(err);
	}
};

export const updateDeckController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = deckIdSchema.parse(req.params);
		const parsed = deckUpdateSchema.parse(req.body);

		// Get existing deck to merge with updates
		const existing = await getDeckById(Number(id));
		if (!existing) {
			return res.status(404).json({ message: 'Deck not found' });
		}

		const title = parsed.title ?? existing.title;
		const description =
			parsed.description !== undefined
				? parsed.description
				: existing.description;
		const category = parsed.category ?? existing.category;

		const updated = await updateDeck(
			Number(id),
			title,
			description,
			category
		);
		if (!updated) {
			return res.status(404).json({ message: 'Deck not found' });
		}
		return res.status(200).json(updated);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid deck data' });
		}
		next(err);
	}
};

export const deleteDeckController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = deckIdSchema.parse(req.params);
		const deleted = await deleteDeck(Number(id));
		if (!deleted) {
			return res.status(404).json({ message: 'Deck not found' });
		}
		return res.status(200).json(deleted);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid deck id' });
		}
		next(err);
	}
};

export const getDeckByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = deckIdSchema.parse(req.params);
		const deck = await getDeckById(Number(id));
		if (!deck) {
			return res.status(404).json({ message: 'Deck not found' });
		}
		return res.status(200).json(deck);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid deck id' });
		}
		next(err);
	}
};

export const getAllDecksController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const decks = await getAllDecks();
		return res.status(200).json(decks);
	} catch (err) {
		next(err);
	}
};

export const getDecksByOwnerIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const ownerId = req.query.ownerId as string;
		if (!ownerId) {
			return res.status(400).json({ message: 'ownerId is required' });
		}
		const decks = await getDecksByOwnerId(ownerId);
		return res.status(200).json(decks);
	} catch (err) {
		next(err);
	}
};

export const getDecksByCategoryController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const category = req.query.category as string;
		if (!category) {
			return res.status(400).json({ message: 'category is required' });
		}
		const decks = await getDecksByCategory(category);
		return res.status(200).json(decks);
	} catch (err) {
		next(err);
	}
};
