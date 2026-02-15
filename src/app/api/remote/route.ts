import { NextResponse } from 'next/server';
import { executeCommand } from '@/lib/adb';

export async function POST(request: Request) {
  const { keyCode } = await request.json();

  if (!keyCode) {
    return NextResponse.json({ error: 'Key code is required' }, { status: 400 });
  }

  const deviceIp = process.env.ATV_DEVICE_IP;
  if (!deviceIp) {
    console.error('ATV_DEVICE_IP environment variable not set.');
    return NextResponse.json({ error: 'Android TV device IP is not configured on the server. Please set ATV_DEVICE_IP in .env file.' }, { status: 500 });
  }

  const deviceAddress = `${deviceIp}:5555`;

  try {
    await executeCommand(`adb connect ${deviceAddress}`);

    const remoteCommand = `adb -s ${deviceAddress} shell input keyevent ${keyCode}`;
    const { stderr } = await executeCommand(remoteCommand);

    if (stderr && stderr.toLowerCase().includes('error')) {
       throw new Error(`Failed to send key event: ${stderr}`);
    }

    return NextResponse.json({ success: true, message: `Sent key code ${keyCode}.` });

  } catch (error: any) {
    console.error(`Failed to send key code ${keyCode}:`, error.message);
    
    // Attempt to kill the adb server to reset state in case of issues.
    await executeCommand('adb kill-server').catch(e => console.error("Failed to kill adb server", e));

    return NextResponse.json({ error: 'Failed to execute ADB command. Make sure ADB is installed, and the device is connected and authorized.', details: error.message }, { status: 500 });
  }
}
