import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith('/api/proxy/')) {
		const backendUrl = process.env.BACKEND_URL;
		if (!backendUrl) {
			console.error(
				'Error: BACKEND_URL environment variable is not set.'
			);
			return new NextResponse(
				'Internal Server Error: Proxy not configured.',
				{
					status: 500,
				}
			);
		}

		// Get the JWT token from NextAuth
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		});

		const path = request.nextUrl.pathname.replace('/api/proxy', '/api/v1');
		const newUrl = new URL(path, backendUrl);
		request.nextUrl.searchParams.forEach((value, key) => {
			newUrl.searchParams.append(key, value);
		});

		// Clone headers and add Authorization if token exists
		const requestHeaders = new Headers(request.headers);
		if (token?.backendToken) {
			// Pass the backend JWT token
			requestHeaders.set('Authorization', `Bearer ${token.backendToken}`);
		}

		return NextResponse.rewrite(newUrl, {
			request: {
				headers: requestHeaders,
			},
		});
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/api/proxy/:path*'],
};
