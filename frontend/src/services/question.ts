import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

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

// GET - Get questions by topicId(s)
export const useGetQuestionsByTopicId = (
	topicId: string | number | Array<string | number> | null
) => {
	console.log(topicId);
	// Accepts: null, single id, comma-separated string, or array
	let topicIdsParam = '';
	if (Array.isArray(topicId)) {
		topicIdsParam = topicId.join(',');
	} else if (typeof topicId === 'string') {
		topicIdsParam = topicId;
	} else if (typeof topicId === 'number') {
		topicIdsParam = String(topicId);
	}
	return useQuery({
		queryKey: ['questions-by-topic', topicIdsParam],
		queryFn: async () => {
			if (!topicIdsParam) return [];
			const { data } = await instance.get(
				`/by-topic?topicIds=${topicIdsParam}`
			);
			return data;
		},
		enabled: !!topicIdsParam,
	});
};

// PATCH - Increment question priority
export const useIncrementQuestionPriority = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string | number) => {
			const { data } = await instance.patch(`/${id}/increment-priority`);
			return data;
		},
		onSuccess: (_, id) => {
			// Invalidate all relevant queries to refetch updated data
			queryClient.invalidateQueries({ queryKey: ['questions'] });
			queryClient.invalidateQueries({ queryKey: ['questions-by-topic'] });
			queryClient.invalidateQueries({ queryKey: ['question', id] });
		},
	});
};

// PATCH - Decrement question priority
export const useDecrementQuestionPriority = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string | number) => {
			const { data } = await instance.patch(`/${id}/decrement-priority`);
			return data;
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['questions'] });
			queryClient.invalidateQueries({ queryKey: ['questions-by-topic'] });
			queryClient.invalidateQueries({ queryKey: ['question', id] });
		},
	});
};
