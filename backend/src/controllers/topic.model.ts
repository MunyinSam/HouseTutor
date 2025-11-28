import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
	createTopic,
	updateTopic,
	deleteTopic,
	getTopicById,
	getAllTopics,
} from '../models/topic.model';

const topicIdSchema = z.object({ id: z.string().uuid() });
const topicCreateSchema = z.object({
	name: z.string(),
	description: z.string().nullable().optional(),
});
const topicUpdateSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable().optional(),
});

export const createTopicController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { name, description } = topicCreateSchema.parse(req.body);
		const topic = await createTopic(name, description ?? null);
		return res.status(201).json(topic);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid topic data' });
		}
		next(err);
	}
};

export const updateTopicController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = topicIdSchema.parse(req.params);
		const { name, description } = topicCreateSchema.parse(req.body);
		const updated = await updateTopic(id, name, description ?? null);
		if (!updated) {
			return res.status(404).json({ message: 'Topic not found' });
		}
		return res.status(200).json(updated);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid topic data' });
		}
		next(err);
	}
};

export const deleteTopicController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = topicIdSchema.parse(req.params);
		const deleted = await deleteTopic(id);
		if (!deleted) {
			return res.status(404).json({ message: 'Topic not found' });
		}
		return res.status(200).json(deleted);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid topic id' });
		}
		next(err);
	}
};

export const getTopicByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = topicIdSchema.parse(req.params);
		const topic = await getTopicById(id);
		if (!topic) {
			return res.status(404).json({ message: 'Topic not found' });
		}
		return res.status(200).json(topic);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ message: 'Invalid topic id' });
		}
		next(err);
	}
};

export const getAllTopicsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const topics = await getAllTopics();
		return res.status(200).json(topics);
	} catch (err) {
		next(err);
	}
};
