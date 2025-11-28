import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/question',
});

// Types
export interface Question {
	id: string;
	question: string;
	answer: string;
	topicId: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateQuestionBody {
	question: string;
	answer: string;
	topicId: number;
}

export interface UpdateQuestionBody {
	question: string;
	answer: string;
	topicId: number;
}

// POST - Create question
export const useCreateQuestion = () => {
	return useMutation({
		mutationFn: async (body: CreateQuestionBody) => {
			const { data } = await instance.post('/', body);
			return data;
		},
	});
};

// PATCH - Update question
export const useUpdateQuestion = () => {
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: UpdateQuestionBody;
		}) => {
			const { data } = await instance.patch(`/${id}`, body);
			return data;
		},
	});
};

// GET - Get all questions
export const useGetQuestions = () => {
	return useQuery({
		queryKey: ['questions'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
	});
};

// GET - Get question by id
export const useGetQuestionById = (id: string) => {
	return useQuery({
		queryKey: ['question', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		enabled: !!id,
	});
};

// DELETE - Delete question
export const useDeleteQuestion = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
	});
};
