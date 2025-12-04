import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
// Assuming '@/types/index' exports the User interface as 'User'
import * as t from '@/types/index';

// Client-side instance (uses proxy middleware)
const instance = axios.create({
	baseURL: '/api/proxy/user',
});

// Server-side instance (uses direct backend URL)
const getServerInstance = () => {
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
	return axios.create({
		baseURL: `${backendUrl}/api/v1/user`,
	});
};

/**
 * Type for creating a new user.
 * ID is required by the controller's Zod schema.
 * Name is optional in the request body (handled as null on the backend).
 */
export interface CreateUserBody {
	id: string;
	email: string;
	name?: string | null;
}

/**
 * Type for updating an existing user.
 * All fields are optional as the update can be partial.
 */
export interface UpdateUserBody {
	email?: string;
	name?: string | null;
}

// ------------------------------------
// MUTATIONS (Create, Update, Delete)
// ------------------------------------

// POST - Create user
export const useCreateUser = () => {
	const queryClient = useQueryClient();
	return useMutation<t.User, Error, CreateUserBody>({
		mutationFn: async (body) => {
			const { data } = await instance.post('/', body);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['user', data.id] });
		},
	});
};

// Direct API call for server-side usage (e.g., NextAuth callbacks)
export const createUser = async (body: CreateUserBody): Promise<t.User> => {
	const serverInstance = getServerInstance();
	const { data } = await serverInstance.post('/', body);
	return data;
};

export const getUserByEmail = async (email: string): Promise<t.User | null> => {
	try {
		const serverInstance = getServerInstance();
		const { data } = await serverInstance.get(`/email?email=${email}`);
		return data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return null;
		}
		throw error;
	}
};

// PATCH - Update user by ID
export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	return useMutation<t.User, Error, { id: string; body: UpdateUserBody }>({
		mutationFn: async ({ id, body }) => {
			const { data } = await instance.patch(`/${id}`, body);
			return data;
		},
		onSuccess: (data) => {
			// Invalidate single user query and all users list
			queryClient.invalidateQueries({ queryKey: ['user', data.id] });
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({
				queryKey: ['user', 'email', data.email],
			});
		},
	});
};

// DELETE - Delete user by ID
export const useDeleteUser = () => {
	const queryClient = useQueryClient();
	return useMutation<t.User, Error, string>({
		mutationFn: async (id) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
		onSuccess: (data) => {
			// Invalidate all relevant queries upon successful deletion
			queryClient.invalidateQueries({ queryKey: ['user', data.id] });
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({
				queryKey: ['user', 'email', data.email],
			});
		},
	});
};

// ------------------------------------
// QUERIES (Read)
// ------------------------------------

// GET - Get user by ID
export const useGetUserById = (id: string | undefined) => {
	return useQuery<t.User, Error>({
		queryKey: ['user', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		// Only run the query if 'id' is defined
		enabled: !!id,
	});
};

// GET - Get user by email (using query params, as defined in the controller)
export const useGetUserByEmail = (email: string | undefined) => {
	return useQuery<t.User, Error>({
		queryKey: ['user', 'email', email],
		queryFn: async () => {
			const { data } = await instance.get(`/by-email?email=${email}`);
			return data;
		},
		// Only run the query if 'email' is defined and not an empty string
		enabled: !!email,
	});
};

// GET - Get all users
export const useGetAllUsers = () => {
	return useQuery<t.User[], Error>({
		queryKey: ['users'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
	});
};
