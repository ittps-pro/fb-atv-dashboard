
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { DeviceSchema, type Device } from '@/types/devices';

const devicesFilePath = path.join(process.cwd(), 'config', 'devices.json');
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

async function getDevices(): Promise<Device[]> {
    try {
        const data = await fs.readFile(devicesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        throw error;
    }
}

async function saveDevices(devices: Device[]) {
    await fs.mkdir(path.dirname(devicesFilePath), { recursive: true });
    await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2), 'utf-8');
}


export async function GET() {
    const devices = await withFileLock(getDevices);
    return NextResponse.json(devices);
}

export async function POST(request: Request) {
    const body = await request.json();
    
    const newDeviceData = { ...body, id: new Date().toISOString() + Math.random() };
    
    // Validate with zod schema
    const validation = DeviceSchema.safeParse(newDeviceData);
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid device data', details: validation.error.format() }, { status: 400 });
    }

    await withFileLock(async () => {
        const devices = await getDevices();
        devices.push(validation.data);
        await saveDevices(devices);
    });

    return NextResponse.json(validation.data, { status: 201 });
}
