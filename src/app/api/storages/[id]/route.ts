
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { StorageSchema, type Storage } from '@/types/storage';

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
            return []; // File doesn't exist, return empty array
        }
        throw error;
    }
}

async function saveStorages(storages: Storage[]) {
    await fs.mkdir(path.dirname(storagesFilePath), { recursive: true });
    await fs.writeFile(storagesFilePath, JSON.stringify(storages, null, 2), 'utf-8');
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    let updatedStorage;

    await withFileLock(async () => {
        const storages = await getStorages();
        const body = await request.json();
        
        // Use partial schema for updates
        const validation = StorageSchema.partial().safeParse({ ...body });
         if (!validation.success) {
            throw new Error('Invalid storage data');
        }
        
        const index = storages.findIndex(t => t.id === params.id);
        if (index === -1) {
            return;
        }
    
        storages[index] = { ...storages[index], ...validation.data };
        updatedStorage = storages[index];
        
        await saveStorages(storages);
    });

    if (!updatedStorage) {
        return NextResponse.json({ error: 'Storage not found or invalid data' }, { status: 404 });
    }

    return NextResponse.json(updatedStorage);
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    let storageFound = false;
    
    await withFileLock(async () => {
        let storages = await getStorages();
        const initialLength = storages.length;
        storages = storages.filter(t => t.id !== params.id);
        
        if (storages.length < initialLength) {
            storageFound = true;
            await saveStorages(storages);
        }
    });

    if (!storageFound) {
        return NextResponse.json({ error: 'Storage not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
}
