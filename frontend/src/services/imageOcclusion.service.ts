import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/occlusion',
});

export interface OcclusionRect {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	answer?: string;
}

export interface ImageOcclusion {
	id: number;
	deckId: number;
	title?: string;
	imagePath: string;
	occlusions: OcclusionRect[];
	mode: 'all' | 'one';
	createdAt: string;
	updatedAt: string;
}

export interface CreateImageOcclusionBody {
	deckId: number;
	title?: string;
	occlusions: OcclusionRect[];
	mode?: 'all' | 'one';
	image?: File | null;
}

export interface UpdateImageOcclusionBody {
	title?: string;
	occlusions?: OcclusionRect[];
	mode?: 'all' | 'one';
	image?: File | null;
}

// POST - Create image occlusion
export const useCreateImageOcclusion = () => {
	const queryClient = useQueryClient();
	return useMutation<ImageOcclusion, Error, CreateImageOcclusionBody>({
		mutationFn: async (body) => {
			const formData = new FormData();
			formData.append('deckId', body.deckId.toString());
			formData.append('occlusions', JSON.stringify(body.occlusions));
			if (body.title) formData.append('title', body.title);
			if (body.mode) formData.append('mode', body.mode);
			if (body.image) formData.append('image', body.image);

			const { data } = await instance.post('/', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['imageOcclusions'] });
		},
	});
};

// PATCH - Update image occlusion
export const useUpdateImageOcclusion = () => {
	const queryClient = useQueryClient();
	return useMutation<
		ImageOcclusion,
		Error,
		{ id: number; body: UpdateImageOcclusionBody }
	>({
		mutationFn: async ({ id, body }) => {
			const formData = new FormData();
			if (body.title !== undefined) formData.append('title', body.title);
			if (body.occlusions)
				formData.append('occlusions', JSON.stringify(body.occlusions));
			if (body.mode) formData.append('mode', body.mode);
			if (body.image) formData.append('image', body.image);

			const { data } = await instance.patch(`/${id}`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['imageOcclusion', data.id],
			});
			queryClient.invalidateQueries({ queryKey: ['imageOcclusions'] });
		},
	});
};

// DELETE - Delete image occlusion
export const useDeleteImageOcclusion = () => {
	const queryClient = useQueryClient();
	return useMutation<ImageOcclusion, Error, number>({
		mutationFn: async (id) => {
			const { data } = await instance.delete(`/${id}`);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['imageOcclusions'] });
		},
	});
};

// GET - Get image occlusion by ID
export const useGetImageOcclusionById = (id: number) => {
	return useQuery<ImageOcclusion>({
		queryKey: ['imageOcclusion', id],
		queryFn: async () => {
			const { data } = await instance.get(`/${id}`);
			return data;
		},
		enabled: id > 0,
	});
};

// GET - Get image occlusions by deck ID
export const useGetImageOcclusionsByDeckId = (deckId: number) => {
	return useQuery<ImageOcclusion[]>({
		queryKey: ['imageOcclusions', 'deck', deckId],
		queryFn: async () => {
			const { data } = await instance.get(`/deck?deckId=${deckId}`);
			return data;
		},
		enabled: deckId > 0,
	});
};

// GET - Get all image occlusions
export const useGetAllImageOcclusions = () => {
	return useQuery<ImageOcclusion[]>({
		queryKey: ['imageOcclusions'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
	});
};
