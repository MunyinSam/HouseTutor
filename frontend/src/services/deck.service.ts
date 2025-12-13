import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as t from '@/types/index';

const instance = axios.create({
	baseURL: '/api/proxy/deck',
});

export interface CreateDeckBody {
	title: string;
	description?: string | null;
	category: string;
	ownerId: string;
}

export interface UpdateDeckBody {
	title?: string;
	description?: string | null;
	category?: string;
	ownerId?: string;
}

// POST - Create deck
export const useCreateDeck = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Deck, Error, CreateDeckBody>({
		mutationFn: async (body) => {
			const { data } = await instance.post('/', body);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['decks'] });
		},
	});
};

// PATCH - Update deck
export const useUpdateDeck = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Deck, Error, { id: number; body: UpdateDeckBody }>({
		mutationFn: async ({ id, body }) => {
			const { data } = await instance.patch(`/${id}`, body);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['deck', data.id] });
			queryClient.invalidateQueries({ queryKey: ['decks'] });
		},
	});
};

// DELETE - Delete deck
export const useDeleteDeck = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Deck, Error, number>({
		mutationFn: async (id) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['deck', data.id] });
			queryClient.invalidateQueries({ queryKey: ['decks'] });
		},
	});
};

// GET - Get deck by ID
export const useGetDeckById = (id: number | undefined) => {
	return useQuery<t.Deck, Error>({
		queryKey: ['deck', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		enabled: !!id,
	});
};

// GET - Get all decks
export const useGetAllDecks = () => {
	return useQuery<t.Deck[], Error>({
		queryKey: ['decks'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
	});
};

// GET - Get decks by owner ID
export const useGetDecksByOwnerId = (ownerId: string | undefined) => {
	return useQuery<t.Deck[], Error>({
		queryKey: ['decks', 'owner', ownerId],
		queryFn: async () => {
			const { data } = await instance.get(`/owner?ownerId=${ownerId}`);
			return data;
		},
		enabled: !!ownerId,
	});
};

// GET - Get decks by category
export const useGetDecksByCategory = (category: string | undefined) => {
	return useQuery<t.Deck[], Error>({
		queryKey: ['decks', 'category', category],
		queryFn: async () => {
			const { data } = await instance.get(
				`/category?category=${category}`
			);
			return data;
		},
		enabled: !!category,
	});
};

// PATCH - Set deck as public
export const useUpdateDeckPublic = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Deck, Error, number>({
		mutationFn: async (id) => {
			const { data } = await instance.patch(`/public/${id}`);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['deck', data.id] });
			queryClient.invalidateQueries({ queryKey: ['decks'] });
		},
	});
};

// PATCH - Set deck as private
export const useUpdateDeckPrivate = () => {
	const queryClient = useQueryClient();
	return useMutation<t.Deck, Error, number>({
		mutationFn: async (id) => {
			const { data } = await instance.patch(`/private/${id}`);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['deck', data.id] });
			queryClient.invalidateQueries({ queryKey: ['decks'] });
		},
	});
};
