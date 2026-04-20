import { NextResponse } from 'next/server';
import { executeCommand } from '@/lib/adb';

export async function POST(request: Request) {
  const { command, deviceIp, devicePort } = await request.json();

  if (!command) {
    return NextResponse.json({ error: 'A command is required' }, { status: 400 });
  }

  if (!deviceIp) {
    return NextResponse.json({ error: 'Android TV device IP is not configured.' }, { status: 400 });
  }
  
  const adbPort = devicePort || 5555;
  const deviceAddress = `${deviceIp}:${adbPort}`;

  try {
    await executeCommand(`adb connect ${deviceAddress}`);

    const shellCommand = `adb -s ${deviceAddress} shell "${command.replace(/"/g, '\\"')}"`;
    const { stdout, stderr } = await executeCommand(shellCommand);

    if (stderr) {
       console.warn(`Execution of "${command}" on ${deviceAddress} produced stderr: ${stderr}`);
       // Not throwing an error because many valid commands output to stderr.
       // The client can decide how to interpret the output.
    }

    return NextResponse.json({ success: true, message: 'Command executed.', stdout, stderr });

  } catch (error: any) {
    console.error(`Failed to execute shell command "${command}":`, error.message);
    
    // Attempt to kill the adb server to reset state in case of issues.
    await executeCommand('adb kill-server').catch(e => console.error("Failed to kill adb server", e));

    return NextResponse.json({ error: 'Failed to execute ADB command.', details: error.message }, { status: 500 });
  }
}
