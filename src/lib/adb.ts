'use server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

let adbServerStarted = false;

export async function executeCommand(command: string) {
    try {
        // Ensure the ADB server is running before any ADB command.
        // This is a simple check that runs per server instance lifecycle.
        if (command.startsWith('adb ') && !adbServerStarted) {
            console.log("Ensuring ADB server is running...");
            await execPromise('adb start-server');
            adbServerStarted = true;
            console.log("ADB server confirmed to be running.");
        }

        console.log(`Executing: ${command}`);
        const { stdout, stderr } = await execPromise(command, { timeout: 5000 }); // 5 second timeout
        if (stderr) {
            console.warn(`Stderr for command "${command}":`, stderr);
        }
        return { stdout, stderr };
    } catch (error: any) {
        console.error(`Error executing command "${command}":`, error.message);
        
        // If the error suggests the daemon has stopped, reset the flag
        // so we attempt to start it on the next command.
        if (error.message.includes('daemon not running')) {
            adbServerStarted = false;
        }

        throw error;
    }
}
