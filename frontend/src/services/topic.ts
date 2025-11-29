import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/topic',
});

// Types
export interface Topic {
	id: string;
	name: string;
	description?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTopicBody {
	name: string;
	description?: string | null;
}

export interface UpdateTopicBody {
	name: string;
	description?: string | null;
}

// POST - Create topic
export const useCreateTopic = () => {
	return useMutation({
		mutationFn: async (body: CreateTopicBody) => {
			const { data } = await instance.post('/', body);
			return data;
		},
	});
};

// PATCH - Update topic
export const useUpdateTopic = () => {
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: UpdateTopicBody;
		}) => {
			const { data } = await instance.patch(`/${id}`, body);
			return data;
		},
	});
};

// GET - Get all topics
export const useGetTopics = () => {
	return useQuery({
		queryKey: ['topics'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
		refetchOnMount: true,
		refetchOnWindowFocus: true,
	});
};

// GET - Get topic by id
export const useGetTopicById = (id: string) => {
	return useQuery({
		queryKey: ['topic', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		enabled: !!id,
	});
};

// DELETE - Delete topic
export const useDeleteTopic = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
	});
};
