import { NextResponse } from 'next/server';
import { executeCommand } from '@/lib/adb';

// This is a simplified health check. A robust solution might involve
// checking for a specific service or response from the device.
export async function POST(request: Request) {
  const { ip, port } = await request.json();

  if (!ip) {
    return NextResponse.json({ error: 'Device IP is required' }, { status: 400 });
  }

  const adbPort = port || 5555;
  const deviceAddress = `${ip}:${adbPort}`;

  try {
    // Try to connect. If it fails, it will throw.
    await executeCommand(`adb connect ${deviceAddress}`);
    
    // Check if the device is listed as 'device' and not 'offline' or something else
    const { stdout } = await executeCommand('adb devices');
    if (stdout.includes(deviceAddress) && stdout.split(deviceAddress)[1].trim().startsWith('device')) {
        // We can disconnect immediately to not hold open connections
        await executeCommand(`adb disconnect ${deviceAddress}`);
        return NextResponse.json({ status: 'online' });
    } else {
        return NextResponse.json({ status: 'offline', reason: 'Device not authorized or in a bad state.' }, { status: 503 });
    }

  } catch (error: any) {
    console.error(`Health check failed for ${ip}:`, error.message);
    return NextResponse.json({ status: 'offline', error: error.message }, { status: 503 });
  }
}
