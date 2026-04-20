import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { StreamSchema, type Stream } from '@/types/streams';

const streamsFilePath = path.join(process.cwd(), 'config', 'streams.json');
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

async function getStreams(): Promise<Stream[]> {
    try {
        const data = await fs.readFile(streamsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveStreams(streams: Stream[]) {
    await fs.mkdir(path.dirname(streamsFilePath), { recursive: true });
    await fs.writeFile(streamsFilePath, JSON.stringify(streams, null, 2), 'utf-8');
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    let updatedStream;

    await withFileLock(async () => {
        const streams = await getStreams();
        const body = await request.json();
        
        const validation = StreamSchema.safeParse({ ...body, id: params.id });
         if (!validation.success) {
            return NextResponse.json({ error: 'Invalid stream data', details: validation.error.format() }, { status: 400 });
        }
        
        const index = streams.findIndex(a => a.id === params.id);
        if (index === -1) {
            return;
        }
    
        streams[index] = validation.data;
        updatedStream = streams[index];
        
        await saveStreams(streams);
    });

    if (!updatedStream) {
        return NextResponse.json({ error: 'Stream not found or invalid data' }, { status: 404 });
    }

    return NextResponse.json(updatedStream);
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    let streamFound = false;
    
    await withFileLock(async () => {
        let streams = await getStreams();
        const initialLength = streams.length;
        streams = streams.filter(a => a.id !== params.id);
        
        if (streams.length < initialLength) {
            streamFound = true;
            await saveStreams(streams);
        }
    });

    if (!streamFound) {
        return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
}
