import { NextResponse } from 'next/server';
import { executeCommand } from '@/lib/adb';
import type { Device } from '@/types/devices';
import { promises as fs } from 'fs';
import path from 'path';

async function getDevices(): Promise<Device[]> {
    const devicesFilePath = path.join(process.cwd(), 'config', 'devices.json');
    try {
        const data = await fs.readFile(devicesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { return []; }
}

export async function POST(request: Request) {
  const { streamUrl, deviceId } = await request.json();

  if (!streamUrl || !deviceId) {
    return NextResponse.json({ error: 'Stream URL and Device ID are required' }, { status: 400 });
  }

  const devices = await getDevices();
  const device = devices.find(d => d.id === deviceId);

  if (!device) {
    return NextResponse.json({ error: 'Device not found' }, { status: 404 });
  }
  
  if (device.connectionType !== 'direct') {
      return NextResponse.json({ error: 'This feature is currently only supported for direct device connections.' }, { status: 400 });
  }

  const deviceAddress = `${device.ip}:${device.port || 5555}`;

  try {
    await executeCommand(`adb connect ${deviceAddress}`);
    
    // Command to launch VLC with a stream URL
    const command = `adb -s ${deviceAddress} shell am start -n org.videolan.vlc/org.videolan.vlc.gui.video.VideoPlayerActivity -d "${streamUrl}"`;
    
    const { stderr } = await executeCommand(command);

    if (stderr && (stderr.toLowerCase().includes('error') || stderr.includes('activity not found'))) {
      throw new Error(`Failed to launch VLC. Is it installed? ADB error: ${stderr}`);
    }

    return NextResponse.json({ success: true, message: `Sent stream to ${device.name}.` });

  } catch (error: any) {
    console.error(`Failed to play stream on device:`, error.message);
    await executeCommand('adb kill-server').catch(e => console.error("Failed to kill adb server", e));
    return NextResponse.json({ error: 'Failed to play stream on device.', details: error.message }, { status: 500 });
  }
}
