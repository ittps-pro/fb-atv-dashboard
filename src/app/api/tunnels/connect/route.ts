import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tunnelId } = await request.json();

    if (!tunnelId) {
      return NextResponse.json({ error: 'Tunnel ID is required.' }, { status: 400 });
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    console.log(`Demo: Connecting tunnel ${tunnelId}`);

    return NextResponse.json({ success: true, message: `Successfully established demo connection for tunnel ${tunnelId}.` });

  } catch (error: any) {
    console.error('Tunnel connect API error:', error.message);
    return NextResponse.json({ error: 'Failed to process tunnel connection request.', details: error.message }, { status: 500 });
  }
}
