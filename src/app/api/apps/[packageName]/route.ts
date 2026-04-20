import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AppConfigSchema, type AppConfig } from '@/types/apps';

const appsFilePath = path.join(process.cwd(), 'config', 'apps.json');
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

async function getApps(): Promise<AppConfig[]> {
    try {
        const data = await fs.readFile(appsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveApps(apps: AppConfig[]) {
    await fs.mkdir(path.dirname(appsFilePath), { recursive: true });
    await fs.writeFile(appsFilePath, JSON.stringify(apps, null, 2), 'utf-8');
}

export async function PUT(request: Request, { params }: { params: { packageName: string } }) {
    let updatedApp;
    const packageName = decodeURIComponent(params.packageName);

    await withFileLock(async () => {
        const apps = await getApps();
        const body = await request.json();

        const validation = AppConfigSchema.partial().safeParse(body);
        if (!validation.success) {
            throw new Error('Invalid app data');
        }

        const index = apps.findIndex(app => app.packageName === packageName);
        if (index === -1) {
            return;
        }

        apps[index] = { ...apps[index], ...validation.data, packageName };
        updatedApp = apps[index];

        await saveApps(apps);
    });

    if (!updatedApp) {
        return NextResponse.json({ error: 'App not found or invalid data' }, { status: 404 });
    }

    return NextResponse.json(updatedApp);
}
