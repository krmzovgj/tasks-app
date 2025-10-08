import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getPriority = (priority: string) => {
    switch (priority?.toUpperCase()) {
        case "LOW":
            return "Low";
        case "MEDIUM":
            return "Medium";
        case "HIGH":
            return "High";
        default:
            return "UNKNOWN";
    }
};

export const getStatus = (status: string) => {
    switch (status?.toUpperCase()) {
        case "PENDING":
            return "Pending";
        case "IN_PROGRESS":
            return "In Progress";
        case "DONE":
            return "Done";
        default:
            return "UNKNOWN";
    }
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
        .toLocaleDateString("en-US", {
            month: "short", // "Jan", "Feb", "Mar", ...
            day: "2-digit",
            year: "numeric",
        })
        .replace(",", "");
};
