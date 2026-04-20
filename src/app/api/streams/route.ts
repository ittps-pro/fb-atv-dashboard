
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


export async function GET() {
    const streams = await withFileLock(getStreams);
    return NextResponse.json(streams);
}

export async function POST(request: Request) {
    const body = await request.json();
    
    const newStreamData = { ...body, id: new Date().toISOString() + Math.random() };
    
    const validation = StreamSchema.safeParse(newStreamData);
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid stream data', details: validation.error.format() }, { status: 400 });
    }

    await withFileLock(async () => {
        const streams = await getStreams();
        streams.push(validation.data);
        await saveStreams(streams);
    });

    return NextResponse.json(validation.data, { status: 201 });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const validation = z.array(StreamSchema).safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid stream array data', details: validation.error.format() }, { status: 400 });
    }

    await withFileLock(async () => {
        await saveStreams(validation.data);
    });

    return NextResponse.json(validation.data);
}
