import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const token = await getToken({ req: request });
	if (!token?.accessToken) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;

	const res = await fetch(`${BACKEND_URL}/api/v1/occlusion/${id}`, {
		headers: {
			Authorization: `Bearer ${token.accessToken}`,
		},
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const token = await getToken({ req: request });
	if (!token?.accessToken) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;
	const formData = await request.formData();

	const res = await fetch(`${BACKEND_URL}/api/v1/occlusion/${id}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token.accessToken}`,
		},
		body: formData,
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const token = await getToken({ req: request });
	if (!token?.accessToken) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;

	const res = await fetch(`${BACKEND_URL}/api/v1/occlusion/${id}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token.accessToken}`,
		},
	});

	const data = await res.json();
	return NextResponse.json(data, { status: res.status });
}
