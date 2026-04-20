import { icons, type LucideProps } from "lucide-react";

export const iconNames = [
    'Tv', 'Youtube', 'Twitch', 'Film', 'Clapperboard', 'Gamepad2', 'Music', 'Home', 'Settings',
    'Folder', 'File', 'Download', 'Cloud', 'MessageSquare', 'Mail', 'Calendar', 'Camera', 'ShoppingBag',
    'Book', 'Newspaper', 'Compass', 'Globe', 'Code', 'Terminal', 'AppWindow'
] as const;

export type IconName = typeof iconNames[number];

type IconMap = { [key in IconName]: React.FC<LucideProps> };

export const iconMap: IconMap = {
    Tv: icons.Tv,
    Youtube: icons.Youtube,
    Twitch: icons.Twitch,
    Film: icons.Film,
    Clapperboard: icons.Clapperboard,
    Gamepad2: icons.Gamepad2,
    Music: icons.Music,
    Home: icons.Home,
    Settings: icons.Settings,
    Folder: icons.Folder,
    File: icons.File,
    Download: icons.Download,
    Cloud: icons.Cloud,
    MessageSquare: icons.MessageSquare,
    Mail: icons.Mail,
    Calendar: icons.Calendar,
    Camera: icons.Camera,
    ShoppingBag: icons.ShoppingBag,
    Book: icons.Book,
    Newspaper: icons.Newspaper,
    Compass: icons.Compass,
    Globe: icons.Globe,
    Code: icons.Code,
    Terminal: icons.Terminal,
    AppWindow: icons.AppWindow
};
