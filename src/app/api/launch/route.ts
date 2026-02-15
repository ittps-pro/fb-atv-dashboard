import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * NOTE: This API route requires the 'adb' (Android Debug Bridge) command-line tool
 * to be installed and available in the server's PATH.
 * 
 * You also need to set the ATV_DEVICE_IP environment variable in your .env file
 * to the IP address of your Android TV device. e.g., ATV_DEVICE_IP=192.168.1.100
 * 
 * On your Android TV, you must enable Developer Options and enable ADB Debugging (or Network Debugging).
 * You may need to connect for the first time from your server's terminal with `adb connect <ip_address>`
 * to authorize the connection on the TV.
 */

async function executeCommand(command: string) {
    try {
        console.log(`Executing: ${command}`);
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.warn(`Stderr for command "${command}":`, stderr);
        }
        return { stdout, stderr };
    } catch (error: any) {
        console.error(`Error executing command "${command}":`, error.message);
        throw error;
    }
}


export async function POST(request: Request) {
  const { packageName } = await request.json();

  if (!packageName) {
    return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
  }

  const deviceIp = process.env.ATV_DEVICE_IP;
  if (!deviceIp) {
    console.error('ATV_DEVICE_IP environment variable not set.');
    return NextResponse.json({ error: 'Android TV device IP is not configured on the server. Please set ATV_DEVICE_IP in .env file.' }, { status: 500 });
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
