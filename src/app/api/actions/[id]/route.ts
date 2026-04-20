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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    let updatedAction;

    await withFileLock(async () => {
        const actions = await getActions();
        const body = await request.json();
        
        const validation = ActionSchema.safeParse({ ...body, id: params.id });
         if (!validation.success) {
            return NextResponse.json({ error: 'Invalid action data', details: validation.error.format() }, { status: 400 });
        }
        
        const index = actions.findIndex(a => a.id === params.id);
        if (index === -1) {
            return;
        }
    
        actions[index] = validation.data;
        updatedAction = actions[index];
        
        await saveActions(actions);
    });

    if (!updatedAction) {
        return NextResponse.json({ error: 'Action not found or invalid data' }, { status: 404 });
    }

    return NextResponse.json(updatedAction);
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    let actionFound = false;
    
    await withFileLock(async () => {
        let actions = await getActions();
        const initialLength = actions.length;
        actions = actions.filter(a => a.id !== params.id);
        
        if (actions.length < initialLength) {
            actionFound = true;
            await saveActions(actions);
        }
    });

    if (!actionFound) {
        return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
}
