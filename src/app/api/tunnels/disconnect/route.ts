
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
              tunnel.status = 'disconnecting';
              await saveTunnels(tunnels);
          }
      });
  
      if (!tunnel) {
        return NextResponse.json({ error: 'Tunnel not found.' }, { status: 404 });
      }
  
      console.log(`SIMULATING DISCONNECTION for tunnel: ${tunnel.name} (${tunnel.protocol})`);
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      await withFileLock(async () => {
          const currentTunnels = await getTunnels();
          const currentTunnel = currentTunnels.find(t => t.id === tunnelId);
          if (currentTunnel) {
              currentTunnel.status = 'disconnected';
              await saveTunnels(currentTunnels);
          }
      });
      
      return NextResponse.json({ success: true, message: `Successfully disconnected from ${tunnel.name}.` });
  
    } catch(error: any) {
      console.error('Tunnel disconnect API error:', error.message);
      await withFileLock(async () => {
          const tunnels = await getTunnels();
          const tunnelToUpdate = tunnels.find(t => t.id === tunnelId);
          if (tunnelToUpdate) {
              tunnelToUpdate.status = 'error';
              await saveTunnels(tunnels);
          }
      });
      return NextResponse.json({ error: 'Failed to process tunnel disconnection request.', details: error.message }, { status: 500 });
    }
}
