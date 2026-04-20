import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (response.ok) {
        return NextResponse.json({ status: 'online' });
    } else {
        // If HEAD fails, it could be because the server doesn't support it.
        // We'll consider it 'unknown' instead of 'offline' in many cases.
        // A 404 is a definite offline, though.
        if (response.status === 404) {
            return NextResponse.json({ status: 'offline', reason: `HTTP status ${response.status}` });
        }
        return NextResponse.json({ status: 'unknown', reason: `HTTP status ${response.status}` });
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ status: 'offline', reason: 'Request timed out' }, { status: 504 });
    }
    return NextResponse.json({ status: 'offline', reason: error.message || 'Unknown error' }, { status: 500 });
  }
}
