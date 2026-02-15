import { NextResponse } from 'next/server';
import { executeCommand } from '@/lib/adb';

/**
 * NOTE: This API route requires the 'adb' (Android Debug Bridge) command-line tool
 * to be installed and available in the server's PATH.
 * 
 * On your Android TV, you must enable Developer Options and enable ADB Debugging (or Network Debugging).
 * You may need to connect for the first time from your server's terminal with `adb connect <ip_address>`
 * to authorize the connection on the TV.
 */


export async function POST(request: Request) {
  const { packageName, deviceIp } = await request.json();

  if (!packageName) {
    return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
  }

  if (!deviceIp) {
    return NextResponse.json({ error: 'Android TV device IP is not configured.' }, { status: 400 });
  }

  const deviceAddress = `${deviceIp}:5555`;

  try {
    await executeCommand(`adb connect ${deviceAddress}`);

    const launchCommand = `adb -s ${deviceAddress} shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`;
    const { stderr } = await executeCommand(launchCommand);

    if (stderr && (stderr.toLowerCase().includes('error') || stderr.includes('** No activities found to run, monkey aborted.'))) {
       throw new Error(`Failed to launch app: ${stderr}`);
    }
    
    // Leaving device connected for faster subsequent requests.
    // `adb disconnect` could be added here if desired.

    return NextResponse.json({ success: true, message: `Launch command sent for ${packageName}.` });

  } catch (error: any) {
    console.error(`Failed to launch package ${packageName}:`, error.message);
    
    // Attempt to kill the adb server to reset state in case of issues.
    await executeCommand('adb kill-server').catch(e => console.error("Failed to kill adb server", e));

    return NextResponse.json({ error: 'Failed to execute ADB command. Make sure ADB is installed, and the device is connected and authorized.', details: error.message }, { status: 500 });
  }
}
