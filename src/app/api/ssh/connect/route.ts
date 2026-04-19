import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { host, port, username } = await request.json();

    if (!host || !port || !username) {
      return NextResponse.json({ error: 'Host, port, and username are required.' }, { status: 400 });
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real application, you would establish the SSH tunnel here.
    // For this demo, we'll just return a success message.
    console.log(`Demo SSH connection to ${username}@${host}:${port}`);

    return NextResponse.json({ success: true, message: `Successfully established demo connection to ${host}.` });

  } catch (error: any) {
    console.error('SSH connection API error:', error.message);
    return NextResponse.json({ error: 'Failed to process SSH connection request.', details: error.message }, { status: 500 });
  }
}
