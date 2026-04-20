import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AppConfigSchema } from '@/types/apps';
import { z } from 'zod';
import type { AppConfig } from '@/types/apps';

const appsFilePath = path.join(process.cwd(), 'config', 'apps.json');

async function getApps(): Promise<AppConfig[]> {
    try {
        const data = await fs.readFile(appsFilePath, 'utf-8');
        const apps = JSON.parse(data);
        // Validate each app config
        return z.array(AppConfigSchema).parse(apps);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        console.error("Error reading or parsing apps.json:", error);
        // Return empty array or throw error on validation fail
        return [];
    }
}

export async function GET() {
    const apps = await getApps();
    return NextResponse.json(apps);
}
