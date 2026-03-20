import type { IconType } from "react-icons";

export interface SidebarItem {
    text: string;
    icon: IconType;
    to: string;
    subItems?: SidebarItem[];
    restricted?: boolean;
}