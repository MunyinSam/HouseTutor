import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as t from '@/types/index';

const instance = axios.create({
	baseURL: '/api/proxy/review',
});

export interface CreateReviewBody {
	userId: string;
	flashcardId: number;
	easinessFactor?: number;
	interval?: number;
	consecutiveCorrect?: number;
	nextReviewDate?: string;
}

export interface UpdateReviewBody {
	easinessFactor?: number;
	interval?: number;
	consecutiveCorrect?: number;
	nextReviewDate?: string;
}

export interface ReviewWithFlashcard extends t.Review {
	flashcard?: {
		id: number;
		questionId: number;
		question?: {
			id: number;
			front: string;
			back: string;
			deckId: number;
		};
	};
}

// POST - Create or update review (upsert)
export const useCreateReview = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Review, Error, CreateReviewBody>({
		mutationFn: async (body) => {
			const { data } = await instance.post('/', body);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['reviews'] });
		},
	});
};

// PATCH - Update review (SM-2 progress)
export const useUpdateReview = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Review, Error, { id: number; body: UpdateReviewBody }>(
		{
			mutationFn: async ({ id, body }) => {
				const { data } = await instance.patch(`/${id}`, body);
				return data;
			},
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: ['review', data.id],
				});
				queryClient.invalidateQueries({ queryKey: ['reviews'] });
			},
		}
	);
};

// DELETE - Delete review
export const useDeleteReview = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Review, Error, number>({
		mutationFn: async (id) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['review', data.id] });
			queryClient.invalidateQueries({ queryKey: ['reviews'] });
		},
	});
};

// GET - Get review by ID
export const useGetReviewById = (id: number | undefined) => {
	return useQuery<t.Review, Error>({
		queryKey: ['review', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		enabled: !!id,
	});
};

// GET - Get review by user and flashcard
export const useGetReviewByUserAndFlashcard = (
	userId: string | undefined,
	flashcardId: number | undefined
) => {
	return useQuery<t.Review, Error>({
		queryKey: ['review', 'find', userId, flashcardId],
		queryFn: async () => {
			const { data } = await instance.get(
				`/find?userId=${userId}&flashcardId=${flashcardId}`
			);
			return data;
		},
		enabled: !!userId && !!flashcardId,
	});
};

// GET - Get all reviews by user ID
export const useGetReviewsByUserId = (userId: string | undefined) => {
	return useQuery<ReviewWithFlashcard[], Error>({
		queryKey: ['reviews', 'user', userId],
		queryFn: async () => {
			const { data } = await instance.get(`/user?userId=${userId}`);
			return data;
		},
		enabled: !!userId,
	});
};

// GET - Get all reviews by flashcard ID
export const useGetReviewsByFlashcardId = (flashcardId: number | undefined) => {
	return useQuery<t.Review[], Error>({
		queryKey: ['reviews', 'flashcard', flashcardId],
		queryFn: async () => {
			const { data } = await instance.get(
				`/flashcard?flashcardId=${flashcardId}`
			);
			return data;
		},
		enabled: !!flashcardId,
	});
};

// GET - Get due reviews for user (for spaced repetition)
export const useGetDueReviews = (userId: string | undefined) => {
	return useQuery<ReviewWithFlashcard[], Error>({
		queryKey: ['reviews', 'due', userId],
		queryFn: async () => {
			const { data } = await instance.get(`/due?userId=${userId}`);
			return data;
		},
		enabled: !!userId,
	});
};
