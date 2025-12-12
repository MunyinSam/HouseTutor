import { Request, Response } from 'express';
import { z } from 'zod';
import * as ImageOcclusionModel from '../models/imageOcclusion.model';

// Zod Schemas
const occlusionRectSchema = z.object({
	id: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	label: z.string(),
	answer: z.string().optional(),
});

const createImageOcclusionSchema = z.object({
	deckId: z.number().int().positive('Deck ID must be a positive integer'),
	imagePath: z.string().optional(),
	occlusions: z.array(occlusionRectSchema),
	title: z.string().optional(),
	mode: z.enum(['all', 'one']).optional().default('all'),
});

const updateImageOcclusionSchema = z.object({
	title: z.string().optional(),
	imagePath: z.string().optional(),
	occlusions: z.array(occlusionRectSchema).optional(),
	mode: z.enum(['all', 'one']).optional(),
});

// POST - Create ImageOcclusion
export const createImageOcclusionController = async (
	req: Request,
	res: Response
) => {
	try {
		// Get imagePath from uploaded file or body (no /uploads/ prefix - frontend proxy adds it)
		const imagePath = req.file
			? `occlusions/${req.file.filename}`
			: req.body.imagePath || '';

		// Parse occlusions from JSON string if needed
		let occlusions = req.body.occlusions;
		if (typeof occlusions === 'string') {
			occlusions = JSON.parse(occlusions);
		}

		const parsed = createImageOcclusionSchema.parse({
			...req.body,
			deckId: parseInt(req.body.deckId, 10),
			imagePath,
			occlusions,
		});

		const imageOcclusion = await ImageOcclusionModel.createImageOcclusion(
			parsed.deckId,
			parsed.imagePath || '',
			parsed.occlusions,
			parsed.title,
			parsed.mode
		);

		res.status(201).json(imageOcclusion);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.errors });
		}
		console.error('Error creating image occlusion:', error);
		res.status(500).json({ error: 'Failed to create image occlusion' });
	}
};

// PATCH - Update ImageOcclusion
export const updateImageOcclusionController = async (
	req: Request,
	res: Response
) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res
				.status(400)
				.json({ error: 'Invalid image occlusion ID' });
		}

		// Get imagePath from uploaded file or body (no /uploads/ prefix - frontend proxy adds it)
		const imagePath = req.file
			? `occlusions/${req.file.filename}`
			: req.body.imagePath;

		// Parse occlusions from JSON string if needed
		let occlusions = req.body.occlusions;
		if (typeof occlusions === 'string') {
			occlusions = JSON.parse(occlusions);
		}

		const parsed = updateImageOcclusionSchema.parse({
			...req.body,
			imagePath,
			occlusions,
		});

		const imageOcclusion = await ImageOcclusionModel.updateImageOcclusion(
			id,
			parsed.title,
			parsed.imagePath,
			parsed.occlusions,
			parsed.mode
		);

		if (!imageOcclusion) {
			return res.status(404).json({ error: 'Image occlusion not found' });
		}

		res.json(imageOcclusion);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.errors });
		}
		console.error('Error updating image occlusion:', error);
		res.status(500).json({ error: 'Failed to update image occlusion' });
	}
};

// DELETE - Delete ImageOcclusion
export const deleteImageOcclusionController = async (
	req: Request,
	res: Response
) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res
				.status(400)
				.json({ error: 'Invalid image occlusion ID' });
		}

		const imageOcclusion =
			await ImageOcclusionModel.deleteImageOcclusion(id);

		if (!imageOcclusion) {
			return res.status(404).json({ error: 'Image occlusion not found' });
		}

		res.json(imageOcclusion);
	} catch (error) {
		console.error('Error deleting image occlusion:', error);
		res.status(500).json({ error: 'Failed to delete image occlusion' });
	}
};

// GET - Get ImageOcclusion by ID
export const getImageOcclusionByIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (isNaN(id)) {
			return res
				.status(400)
				.json({ error: 'Invalid image occlusion ID' });
		}

		const imageOcclusion =
			await ImageOcclusionModel.getImageOcclusionById(id);

		if (!imageOcclusion) {
			return res.status(404).json({ error: 'Image occlusion not found' });
		}

		res.json(imageOcclusion);
	} catch (error) {
		console.error('Error fetching image occlusion:', error);
		res.status(500).json({ error: 'Failed to fetch image occlusion' });
	}
};

// GET - Get ImageOcclusions by Deck ID
export const getImageOcclusionsByDeckIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const deckId = parseInt(req.query.deckId as string, 10);
		if (isNaN(deckId)) {
			return res.status(400).json({ error: 'Invalid deck ID' });
		}

		const imageOcclusions =
			await ImageOcclusionModel.getImageOcclusionsByDeckId(deckId);
		res.json(imageOcclusions);
	} catch (error) {
		console.error('Error fetching image occlusions by deck:', error);
		res.status(500).json({ error: 'Failed to fetch image occlusions' });
	}
};

// GET - Get all ImageOcclusions
export const getAllImageOcclusionsController = async (
	req: Request,
	res: Response
) => {
	try {
		const imageOcclusions =
			await ImageOcclusionModel.getAllImageOcclusions();
		res.json(imageOcclusions);
	} catch (error) {
		console.error('Error fetching image occlusions:', error);
		res.status(500).json({ error: 'Failed to fetch image occlusions' });
	}
};
