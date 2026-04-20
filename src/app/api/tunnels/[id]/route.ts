
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


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    let updatedTunnel;

    await withFileLock(async () => {
        const tunnels = await getTunnels();
        const body = await request.json();
        
        // Use partial schema for updates, ensuring ID is not changed from params
        const validation = TunnelSchema.partial().safeParse({ ...body });
         if (!validation.success) {
            throw new Error('Invalid tunnel data');
        }
        
        const index = tunnels.findIndex(t => t.id === params.id);
        if (index === -1) {
            return; // will result in 404 below
        }
    
        // Merge new data but preserve original ID and status
        tunnels[index] = { ...tunnels[index], ...validation.data };
        updatedTunnel = tunnels[index];
        
        await saveTunnels(tunnels);
    });

    if (!updatedTunnel) {
        return NextResponse.json({ error: 'Tunnel not found or invalid data' }, { status: 404 });
    }

    return NextResponse.json(updatedTunnel);
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    let tunnelFound = false;
    
    await withFileLock(async () => {
        let tunnels = await getTunnels();
        const initialLength = tunnels.length;
        tunnels = tunnels.filter(t => t.id !== params.id);
        
        if (tunnels.length < initialLength) {
            tunnelFound = true;
            await saveTunnels(tunnels);
        }
    });

    if (!tunnelFound) {
        return NextResponse.json({ error: 'Tunnel not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
}
