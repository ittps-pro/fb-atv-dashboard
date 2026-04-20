
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


export async function GET() {
    const storages = await withFileLock(getStorages);
    return NextResponse.json(storages);
}

export async function POST(request: Request) {
    const body = await request.json();
    
    // Create new storage data, status is always unmounted initially.
    const newStorageData = { ...body, id: new Date().toISOString() + Math.random(), status: 'unmounted' };
    
    // Validate with zod schema
    const validation = StorageSchema.safeParse(newStorageData);
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid storage data', details: validation.error.format() }, { status: 400 });
    }

    await withFileLock(async () => {
        const storages = await getStorages();
        storages.push(validation.data);
        await saveStorages(storages);
    });

    return NextResponse.json(validation.data, { status: 201 });
}
