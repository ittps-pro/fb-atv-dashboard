
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { TunnelSchema, type Tunnel } from '@/types/tunnels';

const tunnelsFilePath = path.join(process.cwd(), 'config', 'tunnels.json');
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

async function getTunnels(): Promise<Tunnel[]> {
    try {
        const data = await fs.readFile(tunnelsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        throw error;
    }
}

async function saveTunnels(tunnels: Tunnel[]) {
    await fs.mkdir(path.dirname(tunnelsFilePath), { recursive: true });
    await fs.writeFile(tunnelsFilePath, JSON.stringify(tunnels, null, 2), 'utf-8');
}


export async function GET() {
    const tunnels = await withFileLock(getTunnels);
    return NextResponse.json(tunnels);
}

export async function POST(request: Request) {
    const body = await request.json();
    
    // Create new tunnel data, status is always disconnected initially.
    const newTunnelData = { ...body, id: new Date().toISOString() + Math.random(), status: 'disconnected' };
    
    // Validate with zod schema
    const validation = TunnelSchema.safeParse(newTunnelData);
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid tunnel data', details: validation.error.format() }, { status: 400 });
    }

    await withFileLock(async () => {
        const tunnels = await getTunnels();
        tunnels.push(validation.data);
        await saveTunnels(tunnels);
    });

    return NextResponse.json(validation.data, { status: 201 });
}
