import { LayoutTemplate } from "@/types/layouts";

export const layoutTemplates: LayoutTemplate[] = [
    {
        id: 'default',
        name: 'Default',
        layout: [
            'recommendations',
            'appLauncher',
            'fileManager',
            'notes',
            'videoStream',
            'news',
            'weather',
            'sports',
            'remoteControl',
        ]
    },
    {
        id: 'video-focused',
        name: 'Video Focused',
        layout: [
            'videoStream',
            'appLauncher',
            'remoteControl',
            'recommendations',
            'notes',
            'weather',
            'sports',
            'fileManager',
            'news',
        ]
    },
    {
        id: 'info-hub',
        name: 'Info Hub',
        layout: [
            'news',
            'weather',
            'sports',
            'appLauncher',
            'notes',
            'fileManager',
            'recommendations',
            'remoteControl',
            'videoStream',
        ]
    }
];
