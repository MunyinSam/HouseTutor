import axios from 'axios';
import { getSession } from 'next-auth/react';

// Client-side axios instance with auth interceptor
export const createAuthenticatedInstance = (baseURL: string) => {
	const instance = axios.create({
		baseURL,
	});

	// Add request interceptor to attach JWT token
	instance.interceptors.request.use(
		async (config) => {
			if (typeof window !== 'undefined') {
				// Client-side: get session from NextAuth
				const session = await getSession();
				if (session?.user) {
					// NextAuth stores the JWT in the session token
					// We need to get the raw JWT token
					const response = await fetch('/api/auth/session');
					const data = await response.json();

					// If we have a token, attach it
					if (data?.accessToken) {
						config.headers.Authorization = `Bearer ${data.accessToken}`;
					}
				}
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Add response interceptor to handle 401 errors
	instance.interceptors.response.use(
		(response) => response,
		async (error) => {
			if (error.response?.status === 401) {
				// Redirect to login page on unauthorized
				if (typeof window !== 'undefined') {
					window.location.href = '/auth/login';
				}
			}
			return Promise.reject(error);
		}
	);

	return instance;
};
