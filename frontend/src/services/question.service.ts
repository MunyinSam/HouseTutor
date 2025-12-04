import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/question',
});

export interface Question {
	id: number;
	front: string;
	back: string;
	deckId: number;
	parentId: number | null;
	subQuestions?: Question[];
}

export interface CreateQuestionBody {
	front: string;
	back: string;
	deckId: number;
	parentId?: number | null;
}

export interface UpdateQuestionBody {
	front?: string;
	back?: string;
	deckId?: number;
	parentId?: number | null;
}

// POST - Create question
export const useCreateQuestion = () => {
	const queryClient = useQueryClient();
	return useMutation<Question, Error, CreateQuestionBody>({
		mutationFn: async (body) => {
			const { data } = await instance.post('/', body);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['questions'] });
		},
	});
};

// PATCH - Update question
export const useUpdateQuestion = () => {
	const queryClient = useQueryClient();
	return useMutation<
		Question,
		Error,
		{ id: number; body: UpdateQuestionBody }
	>({
		mutationFn: async ({ id, body }) => {
			const { data } = await instance.patch(`/${id}`, body);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['question', data.id] });
			queryClient.invalidateQueries({ queryKey: ['questions'] });
		},
	});
};

// DELETE - Delete question
export const useDeleteQuestion = () => {
	const queryClient = useQueryClient();
	return useMutation<Question, Error, number>({
		mutationFn: async (id) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['question', data.id] });
			queryClient.invalidateQueries({ queryKey: ['questions'] });
		},
	});
};

// GET - Get question by ID
export const useGetQuestionById = (id: number | undefined) => {
	return useQuery<Question, Error>({
		queryKey: ['question', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		enabled: !!id,
	});
};

// GET - Get all questions
export const useGetAllQuestions = () => {
	return useQuery<Question[], Error>({
		queryKey: ['questions'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
	});
};

// GET - Get questions by deck ID
export const useGetQuestionsByDeckId = (deckId: number | undefined) => {
	return useQuery<Question[], Error>({
		queryKey: ['questions', 'deck', deckId],
		queryFn: async () => {
			const { data } = await instance.get(`/deck?deckId=${deckId}`);
			return data;
		},
		enabled: !!deckId,
	});
};

// GET - Get sub-questions by parent ID
export const useGetSubQuestions = (parentId: number | undefined) => {
	return useQuery<Question[], Error>({
		queryKey: ['questions', 'parent', parentId],
		queryFn: async () => {
			const { data } = await instance.get(`/${parentId}/sub`);
			return data;
		},
		enabled: !!parentId,
	});
};
