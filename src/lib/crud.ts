import { Priority, Status, Task } from "@/styles/models";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

/* =========================================================
   TASKS
========================================================= */

// 🔹 Fetch tasks (by userId, optionally folderId)
export const fetchTasks = async (
    token: string,
    userId: number,
    folderId?: number,
    archived?: boolean
): Promise<Task[]> => {
    try {
        const query = new URLSearchParams({
            userId: String(userId),
            ...(folderId !== undefined ? { folderId: String(folderId) } : {}),
            ...(archived !== undefined ? { archived: String(archived) } : {}),
        }); 

        const response = await fetch(`${BASE_URL}/task?${query.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch tasks");
        return await response.json();
    } catch (error) {
        console.error("fetchTasks error:", error);
        return [];
    }
};

// 🔹 Create a task (userId required, folderId optional)
export const createTask = async (
    token: string,
    data: {
        title: string;
        priority: Priority;
        userId: number;
        folderId?: number | null;
    }
): Promise<Task> => {
    try {
        const response = await fetch(`${BASE_URL}/task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("Failed to create task");
        return await response.json();
    } catch (error) {
        console.error("createTask error:", error);
        throw error;
    }
};

// 🔹 Edit task
export const editTask = async (
    token: string,
    taskId: number,
    updates: Partial<{
        title: string;
        priority: Priority;
        status: Status;
        archived: boolean;
        folderId: number | null;
        userId: number,
    }>
): Promise<Task> => {
    try {
        const response = await fetch(`${BASE_URL}/task/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Failed to update task");
        return await response.json();
    } catch (error) {
        console.error("editTask error:", error);
        throw error;
    }
};

// 🔹 Delete task
export const deleteTask = async (token: string, taskId: number) => {
    try {
        const response = await fetch(`${BASE_URL}/task/${taskId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Failed to delete task");
        return true;
    } catch (error) {
        console.error("deleteTask error:", error);
        throw error;
    }
};

/* =========================================================
   FOLDERS
========================================================= */

export const createFolder = async (
    token: string,
    data: {
        name: string;
        color: string | null;
        userId: number;
    }
) => {
    try {
        const response = await fetch(`${BASE_URL}/folder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: data.name,
                color: data.color,
                user: { id: data.userId },
            }),
        });

        if (!response.ok) throw new Error("Failed to create folder");
        return await response.json();
    } catch (error) {
        console.error("createFolder error:", error);
        throw error;
    }
};
