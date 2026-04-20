import { NextResponse } from 'next/server';
import { executeCommand } from '@/lib/adb';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * NOTE: This API route requires the 'adb' (Android Debug Bridge) command-line tool
 * to be installed and available in the server's PATH.
 */

export async function POST(request: Request) {
  let tempPath = '';
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const deviceIp = data.get('deviceIp') as string | null;
    const devicePort = data.get('devicePort') as string | null;

    if (!deviceIp) {
      return NextResponse.json({ error: 'Android TV device IP is not configured.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    
    if (!file.name.endsWith('.apk')) {
      return NextResponse.json({ error: 'Invalid file type. Only .apk files are allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Using a local .tmp directory for cross-platform compatibility
    const tempDir = join(process.cwd(), '.tmp');
    await mkdir(tempDir, { recursive: true });
    tempPath = join(tempDir, file.name);
    
    console.log(`Writing file to temporary path: ${tempPath}`);
    await writeFile(tempPath, buffer);

    const adbPort = devicePort || '5555';
    const deviceAddress = `${deviceIp}:${adbPort}`;
    
    await executeCommand(`adb connect ${deviceAddress}`);

    // The -r flag allows re-installing over an existing app version
    const installCommand = `adb -s ${deviceAddress} install -r "${tempPath}"`;
    const { stdout, stderr } = await executeCommand(installCommand);

    if (stderr && !stdout.includes('Success')) {
      // Some devices output non-fatal warnings to stderr, so we check if stdout indicates success.
      if (stderr.toLowerCase().includes('failure')) {
        throw new Error(`Installation failed: ${stderr}`);
      }
      console.warn(`ADB stderr during install: ${stderr}`);
    }
    
    if (!stdout.includes('Success')) {
       throw new Error(`Installation did not succeed. ADB output: ${stdout}`);
    }

    return NextResponse.json({ success: true, message: `Successfully installed ${file.name}.` });

  } catch (error: any) {
    console.error(`Failed to install package:`, error.message);
    if (error.message.includes('more than one device/emulator')) {
      await executeCommand('adb kill-server').catch(e => console.error("Failed to kill adb server", e));
      return NextResponse.json({ error: 'Multiple ADB devices detected. Please ensure only the target Android TV is connected.', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to install APK. Make sure ADB is installed, the device is connected, and authorized.', details: error.message }, { status: 500 });
  } finally {
    if (tempPath) {
      try {
        await unlink(tempPath);
        console.log(`Deleted temporary file: ${tempPath}`);
      } catch (cleanupError: any) {
        console.error(`Failed to delete temporary file ${tempPath}:`, cleanupError.message);
      }
    }
  }
}
