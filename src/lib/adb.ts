'use server';
import { exec, execFile, spawn } from 'child_process';
import { promisify } from 'util';
import path, { resolve, join, extname } from 'path'
import { env } from 'process'

function adb(command: string) {
   const bin = path.resolve(env.ADB!)
   const cmd = path.join(bin, command)
   console.log(cmd)
   return cmd
}

const execPromise = promisify(exec);
// import util from 'node:util';

// // const execFile = util.promisify(require('node:child_process').execFile);
// async function getVersion() {

  
// //   const { stdout } = await exec(path.resolve(proce), ['--version']);
// //   console.log(stdout);
// }

// // getVersion()

export async function executeCommand(command: string) {
    try {
        console.log(`Executing: ${command}`);

        let cmd = adb(command)
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
            // console.warn(`Stderr for command "${command}":`, stderr);
        }
        return { stdout, stderr };
    } catch (error: any) {
        // console.error(`Error executing command "${command}":`, error.message);
        throw error;
    }
}