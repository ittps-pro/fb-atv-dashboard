import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { DashboardAction } from '@/types/actions';
import type { Device } from '@/types/devices';
import { executeCommand } from '@/lib/adb';


async function getActions(): Promise<DashboardAction[]> {
    const actionsFilePath = path.join(process.cwd(), 'config', 'actions.json');
    try {
        const data = await fs.readFile(actionsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { return []; }
}

async function getDevices(): Promise<Device[]> {
    const devicesFilePath = path.join(process.cwd(), 'config', 'devices.json');
    try {
        const data = await fs.readFile(devicesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { return []; }
}

export async function POST(request: Request) {
    const { actionId, deviceId, context } = await request.json();

    if (!actionId || !deviceId) {
        return NextResponse.json({ error: 'Action ID and Device ID are required' }, { status: 400 });
    }

    const actions = await getActions();
    const action = actions.find(a => a.id === actionId);

    if (!action) {
        return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    const devices = await getDevices();
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    
    // For now, only allow direct connections for execution
    if (device.connectionType !== 'direct') {
        return NextResponse.json({ error: 'Action execution is currently only supported for direct device connections.' }, { status: 400 });
    }
    
    const deviceAddress = `${device.ip}:${device.port || 5555}`;

    try {
        await executeCommand(`adb connect ${deviceAddress}`);
        
        let command = '';
        let resultMessage = '';

        if (action.type === 'launch-app') {
            command = `adb -s ${deviceAddress} shell monkey -p ${action.payload.packageName} -c android.intent.category.LAUNCHER 1`;
            resultMessage = `Launch command sent for ${action.payload.packageName}.`;
        } else if (action.type === 'shell-command') {
            let commandToExecute = action.payload.command;
            if (context?.streamUrl) {
                commandToExecute = commandToExecute.replace(/\{URL\}/g, context.streamUrl);
            }
            const escapedCommand = commandToExecute.replace(/"/g, '\\"');
            command = `adb -s ${deviceAddress} shell "${escapedCommand}"`;
            resultMessage = 'Shell command executed.';
        } else {
             return NextResponse.json({ error: 'Unsupported action type' }, { status: 400 });
        }
        
        const { stdout, stderr } = await executeCommand(command);

        if (stderr) {
            if (action.type === 'launch-app' && (stderr.toLowerCase().includes('error') || stderr.includes('** No activities found to run, monkey aborted.'))) {
                throw new Error(`Failed to launch app: ${stderr}`);
            }
             console.warn(`Execution of action "${action.name}" produced stderr: ${stderr}`);
        }

        return NextResponse.json({ success: true, message: resultMessage, stdout, stderr });

    } catch (error: any) {
        console.error(`Failed to execute action ${action.name}:`, error.message);
        await executeCommand('adb kill-server').catch(e => console.error("Failed to kill adb server", e));
        return NextResponse.json({ error: 'Failed to execute action.', details: error.message }, { status: 500 });
    }
}
