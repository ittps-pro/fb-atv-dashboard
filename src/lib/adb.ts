'use server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function executeCommand(command: string) {
    try {
        console.log(`Executing: ${command}`);
        const { stdout, stderr } = await execPromise(command, { timeout: 5000 }); // 5 second timeout
        if (stderr) {
            console.warn(`Stderr for command "${command}":`, stderr);
        }
        return { stdout, stderr };
    } catch (error: any) {
        console.error(`Error executing command "${command}":`, error.message);
        throw error;
    }
}
