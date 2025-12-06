import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const imagePath = params.path.join('/');
  const backendUrl = process.env.BACKEND_URL || 'http://backend:8000';
  
  try {
    const response = await fetch(`${backendUrl}/uploads/${imagePath}`);
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}