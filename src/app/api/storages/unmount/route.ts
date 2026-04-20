import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Storage } from '@/types/storage';

const storagesFilePath = path.join(process.cwd(), 'config', 'storages.json');
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

async function getStorages(): Promise<Storage[]> {
    try {
        const data = await fs.readFile(storagesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveStorages(storages: Storage[]) {
    await fs.mkdir(path.dirname(storagesFilePath), { recursive: true });
    await fs.writeFile(storagesFilePath, JSON.stringify(storages, null, 2), 'utf-8');
}

export async function POST(request: Request) {
    const { storageId } = await request.json();
    if (!storageId) {
      return NextResponse.json({ error: 'Storage ID is required.' }, { status: 400 });
    }
  
    try {
      let storage: Storage | undefined;
      await withFileLock(async () => {
          const storages = await getStorages();
          storage = storages.find(s => s.id === storageId);
          if (storage) {
              storage.status = 'unmounting';
              await saveStorages(storages);
          }
      });
  
      if (!storage) {
        return NextResponse.json({ error: 'Storage not found.' }, { status: 404 });
      }
  
      console.log(`SIMULATING UNMOUNT for storage: ${storage.name} (${storage.protocol})`);
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      await withFileLock(async () => {
          const currentStorages = await getStorages();
          const currentStorage = currentStorages.find(s => s.id === storageId);
          if (currentStorage) {
              currentStorage.status = 'unmounted';
              await saveStorages(currentStorages);
          }
      });
      
      return NextResponse.json({ success: true, message: `Successfully unmounted ${storage.name}.` });
  
    } catch(error: any) {
      console.error('Storage unmount API error:', error.message);
      await withFileLock(async () => {
          const storages = await getStorages();
          const storageToUpdate = storages.find(s => s.id === storageId);
          if (storageToUpdate) {
              storageToUpdate.status = 'error';
              await saveStorages(storages);
          }
      });
      return NextResponse.json({ error: 'Failed to process unmount request.', details: error.message }, { status: 500 });
    }
}
