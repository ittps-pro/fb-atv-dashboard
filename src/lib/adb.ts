'use server';

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function executeCommand(command: string) {
    try {
        console.log(`Executing: ${command}`);
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.warn(`Stderr for command "${command}":`, stderr);
        }
        return { stdout, stderr };
    } catch (error: any) {
        console.error(`Error executing command "${command}":`, error.message);
        throw error;
    }
}

export async function installTools() {
    try {
        console.log(`Install adb`);
        
        const { stdout, stderr } = await execPromise("");
        if (stderr) {
            console.warn(`Stderr for command "${command}":`, stderr);
        }
        return { stdout, stderr };
    } catch (error: any) {
        console.error(`Error executing command "${command}":`, error.message);
        throw error;
    }
}