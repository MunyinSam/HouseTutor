import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/flashcard',
});

export interface Flashcard {
	id: number;
	questionId: number;
	question?: {
		id: number;
		front: string;
		back: string;
		deckId: number;
		parentId: number | null;
	};
}

export interface CreateFlashcardBody {
	questionId: number;
}

// POST - Create flashcard
export const useCreateFlashcard = () => {
	const queryClient = useQueryClient();
	return useMutation<Flashcard, Error, CreateFlashcardBody>({
		mutationFn: async (body) => {
			const { data } = await instance.post('/', body);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['flashcards'] });
		},
	});
};

// DELETE - Delete flashcard
export const useDeleteFlashcard = () => {
	const queryClient = useQueryClient();
	return useMutation<Flashcard, Error, number>({
		mutationFn: async (id) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['flashcard', data.id] });
			queryClient.invalidateQueries({ queryKey: ['flashcards'] });
		},
	});
};

// GET - Get flashcard by ID
export const useGetFlashcardById = (id: number | undefined) => {
	return useQuery<Flashcard, Error>({
		queryKey: ['flashcard', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		enabled: !!id,
	});
};

// GET - Get flashcard by question ID
export const useGetFlashcardByQuestionId = (questionId: number | undefined) => {
	return useQuery<Flashcard, Error>({
		queryKey: ['flashcard', 'question', questionId],
		queryFn: async () => {
			const { data } = await instance.get(
				`/question?questionId=${questionId}`
			);
			return data;
		},
		enabled: !!questionId,
	});
};

// GET - Get all flashcards
export const useGetAllFlashcards = () => {
	return useQuery<Flashcard[], Error>({
		queryKey: ['flashcards'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
	});
};
