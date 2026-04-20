import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tunnelId } = await request.json();

    if (!tunnelId) {
      return NextResponse.json({ error: 'Tunnel ID is required.' }, { status: 400 });
    }

    // Simulate disconnection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`Demo: Disconnecting tunnel ${tunnelId}`);

    return NextResponse.json({ success: true, message: `Successfully disconnected demo tunnel ${tunnelId}.` });

  } catch (error: any) {
    console.error('Tunnel disconnect API error:', error.message);
    return NextResponse.json({ error: 'Failed to process tunnel disconnection request.', details: error.message }, { status: 500 });
  }
}
