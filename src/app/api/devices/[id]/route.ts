
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
            return []; 
        }
        throw error;
    }
}

async function saveDevices(devices: Device[]) {
    await fs.mkdir(path.dirname(devicesFilePath), { recursive: true });
    await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2), 'utf-8');
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const device = await withFileLock(async () => {
        const devices = await getDevices();
        return devices.find(d => d.id === params.id);
    });

    if (!device) {
        return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json(device);
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    let updatedDevice;

    await withFileLock(async () => {
        const devices = await getDevices();
        const body = await request.json();
        
        const validation = DeviceSchema.partial().safeParse({ ...body });
         if (!validation.success) {
            throw new Error('Invalid device data');
        }
        
        const index = devices.findIndex(d => d.id === params.id);
        if (index === -1) {
            return; 
        }
    
        devices[index] = { ...devices[index], ...validation.data, id: params.id };
        updatedDevice = devices[index];
        
        await saveDevices(devices);
    });

    if (!updatedDevice) {
        return NextResponse.json({ error: 'Device not found or invalid data' }, { status: 404 });
    }

    return NextResponse.json(updatedDevice);
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    let deviceFound = false;
    
    await withFileLock(async () => {
        let devices = await getDevices();
        const initialLength = devices.length;
        devices = devices.filter(d => d.id !== params.id);
        
        if (devices.length < initialLength) {
            deviceFound = true;
            await saveDevices(devices);
        }
    });

    if (!deviceFound) {
        return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); 
}
