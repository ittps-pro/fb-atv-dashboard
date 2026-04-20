
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Tunnel } from '@/types/tunnels';

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
            return [];
        }
        throw error;
    }
}

async function saveTunnels(tunnels: Tunnel[]) {
    await fs.mkdir(path.dirname(tunnelsFilePath), { recursive: true });
    await fs.writeFile(tunnelsFilePath, JSON.stringify(tunnels, null, 2), 'utf-8');
}


export async function POST(request: Request) {
  const { tunnelId } = await request.json();
  if (!tunnelId) {
    return NextResponse.json({ error: 'Tunnel ID is required.' }, { status: 400 });
  }

  try {
    let tunnel: Tunnel | undefined;
    await withFileLock(async () => {
        const tunnels = await getTunnels();
        tunnel = tunnels.find(t => t.id === tunnelId);
        if (tunnel) {
            tunnel.status = 'connecting';
            await saveTunnels(tunnels);
        }
    });

    if (!tunnel) {
      return NextResponse.json({ error: 'Tunnel not found.' }, { status: 404 });
    }

    console.log(`SIMULATING CONNECTION for tunnel: ${tunnel.name} (${tunnel.protocol})`);
    await new Promise(resolve => setTimeout(resolve, 2500));

    await withFileLock(async () => {
        const currentTunnels = await getTunnels();
        const currentTunnel = currentTunnels.find(t => t.id === tunnelId);
        if (currentTunnel) {
            currentTunnel.status = 'connected';
            await saveTunnels(currentTunnels);
        }
    });
    
    return NextResponse.json({ success: true, message: `Successfully connected to ${tunnel.name}.` });

  } catch(error: any) {
    console.error('Tunnel connect API error:', error.message);
    // Revert status to error on failure
    await withFileLock(async () => {
        const tunnels = await getTunnels();
        const tunnelToUpdate = tunnels.find(t => t.id === tunnelId);
        if (tunnelToUpdate) {
            tunnelToUpdate.status = 'error';
            await saveTunnels(tunnels);
        }
    });
    return NextResponse.json({ error: 'Failed to process tunnel connection request.', details: error.message }, { status: 500 });
  }
}
