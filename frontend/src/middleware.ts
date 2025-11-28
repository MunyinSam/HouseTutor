import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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

		const path = request.nextUrl.pathname.replace('/api/proxy', '/api/v1');
		const newUrl = new URL(path, backendUrl);
		request.nextUrl.searchParams.forEach((value, key) => {
			newUrl.searchParams.append(key, value);
		});

		return NextResponse.rewrite(newUrl, {
			request: {
				headers: request.headers,
			},
		});
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/api/proxy/:path*'],
};
