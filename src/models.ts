export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    folderId: number;
}

export interface Folder {
    id: number;
    name: string;
    color: string;
    tasks: Task[]
}


export type Status = "PENDING" | "IN_PROGRESS" | "DONE"

export type Priority = "LOW" | "MEDIUM" | "HIGH"
