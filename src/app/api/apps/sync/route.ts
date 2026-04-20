import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { executeCommand } from '@/lib/adb';
import type { AppConfig } from '@/types/apps';

const appsFilePath = path.join(process.cwd(), 'config', 'apps.json');
const fileMutex = { locked: false };

async function withFileLock<T>(operation: () => Promise<T>): Promise<T> {
    while (fileMutex.locked) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    fileMutex.locked = true;
    try {
        return await operation();
    } finally {
        fileMutex.locked = false;
    }
}

async function getApps(): Promise<AppConfig[]> {
    try {
        const data = await fs.readFile(appsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveApps(apps: AppConfig[]) {
    await fs.mkdir(path.dirname(appsFilePath), { recursive: true });
    await fs.writeFile(appsFilePath, JSON.stringify(apps, null, 2), 'utf-8');
}

export async function POST(request: Request) {
    const { deviceIp, devicePort } = await request.json();

    if (!deviceIp) {
        return NextResponse.json({ error: 'Device IP is required' }, { status: 400 });
    }

    const adbPort = devicePort || 5555;
    const deviceAddress = `${deviceIp}:${adbPort}`;

    try {
        await executeCommand(`adb connect ${deviceAddress}`);
        
        // List all 3rd party packages
        const { stdout } = await executeCommand(`adb -s ${deviceAddress} shell pm list packages -3`);
        
        const devicePackages = stdout
            .split('\n')
            .map(line => line.replace('package:', '').trim())
            .filter(pkg => pkg);

        await withFileLock(async () => {
            const existingApps = await getApps();
            const existingPackages = new Set(existingApps.map(app => app.packageName));
            const newApps: AppConfig[] = [...existingApps];

            for (const pkg of devicePackages) {
                if (!existingPackages.has(pkg)) {
                    newApps.push({
                        name: pkg.split('.').pop() || pkg, // Simple name extraction
                        iconName: 'Tv', // Default icon
                        packageName: pkg,
                    });
                }
            }

            // Optional: Remove apps from json that are no longer on the device
            const finalApps = newApps.filter(app => !app.packageName || devicePackages.includes(app.packageName));

            await saveApps(finalApps);
        });

        return NextResponse.json({ success: true, message: 'Apps synced successfully with the device.' });

    } catch (error: any) {
        console.error('Failed to sync apps:', error.message);
        return NextResponse.json({ error: 'Failed to sync apps from device.', details: error.message }, { status: 500 });
    }
}
