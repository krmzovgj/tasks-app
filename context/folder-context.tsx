"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import Cookies from "js-cookie";
import { Folder } from "@/styles/models";

interface FolderContextType {
    folders: Folder[];
    refreshFolders: () => Promise<void>;
}

const FolderContext = createContext<FolderContextType>({
    folders: [],
    refreshFolders: async () => {},
});

export function FolderProvider({ children }: { children: ReactNode }) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const token = Cookies.get("token");

    const refreshFolders = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/folder`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setFolders(data);
            }
        } catch (err) {
            console.error("Failed to fetch folders:", err);
        }
    };

    useEffect(() => {
        refreshFolders();
    }, []);

    return (
        <FolderContext.Provider value={{ folders, refreshFolders }}>
            {children}
        </FolderContext.Provider>
    );
}

export const useFolders = () => useContext(FolderContext);
