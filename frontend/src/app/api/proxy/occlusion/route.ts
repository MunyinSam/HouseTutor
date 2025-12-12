import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
	const token = await getToken({ req: request });
	if (!token?.accessToken) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const deckId = searchParams.get('deckId');
	const endpoint = deckId
		? `/api/v1/occlusion/deck?deckId=${deckId}`
		: '/api/v1/occlusion';

	const res = await fetch(`${BACKEND_URL}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${token.accessToken}`,
		},
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
	const token = await getToken({ req: request });
	if (!token?.accessToken) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData();

	const res = await fetch(`${BACKEND_URL}/api/v1/occlusion`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token.accessToken}`,
		},
		body: formData,
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}
