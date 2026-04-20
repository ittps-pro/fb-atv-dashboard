import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ActionSchema, type DashboardAction } from '@/types/actions';

const actionsFilePath = path.join(process.cwd(), 'config', 'actions.json');
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

async function getActions(): Promise<DashboardAction[]> {
    try {
        const data = await fs.readFile(actionsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveActions(actions: DashboardAction[]) {
    await fs.mkdir(path.dirname(actionsFilePath), { recursive: true });
    await fs.writeFile(actionsFilePath, JSON.stringify(actions, null, 2), 'utf-8');
}


export async function GET() {
    const actions = await withFileLock(getActions);
    return NextResponse.json(actions);
}

export async function POST(request: Request) {
    const body = await request.json();
    
    const newActionData = { ...body, id: new Date().toISOString() + Math.random() };
    
    const validation = ActionSchema.safeParse(newActionData);
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid action data', details: validation.error.format() }, { status: 400 });
    }

    await withFileLock(async () => {
        const actions = await getActions();
        actions.push(validation.data);
        await saveActions(actions);
    });

    return NextResponse.json(validation.data, { status: 201 });
}
