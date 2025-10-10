import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate, getPriority, getStatus } from "@/lib/utils";
import { Priority, Status, Task } from "@/styles/models";
import {
    Archive,
    Edit,
    Folder2,
    More,
    RecordCircle,
    Refresh2,
    TickCircle,
    Timer,
    Trash,
} from "iconsax-react";
import Cookies from "js-cookie";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { useEffect, useState } from "react";
import { useFolders } from "../../context/folder-context";
import { useUser } from "../../context/user-context";

import TaskForm from "@/components/ui/task-form";
import {
    createTask as createTaskUtil,
    deleteTask as deleteTaskUtil,
    editTask as editTaskUtil,
    fetchTasks as fetchTasksUtil
} from "@/lib/crud";

export default function Home() {
    const { user, loading } = useUser();
    const { refreshFolders } = useFolders();
    const token = Cookies.get("token");

    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskType, setTaskType] = useState<"UpNext" | "Completed">("UpNext");

    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>("MEDIUM");

    const [taskDialog, settaskDialog] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editPriority, setEditPriority] = useState<Priority>("LOW");
    const [editStatus, setEditStatus] = useState<Status>("PENDING");
    const [editArchived, setEditArchived] = useState<boolean>(false);

    

    const fetchTasks = async () => {
        if (!user) return;
        const data = await fetchTasksUtil(token!, user.id, undefined, false);
        setTasks(data);
    };


    const openEdit = (task: Task) => {
        setEditing(task);
        setEditTitle(task.title ?? "");
        setEditPriority((task.priority as Priority) ?? "LOW");
        setEditStatus((task.status as Status) ?? "PENDING");
        setEditArchived(Boolean((task as any).archived));
        setEditOpen(true);
    };

    useEffect(() => {
        if (!user) return;
        fetchTasks();
    }, [user]);

    const filteredTasks = tasks.filter((task) =>
        taskType === "UpNext"
            ? task.status === "PENDING" || task.status === "IN_PROGRESS"
            : task.status === "DONE"
    );

    const toggleArchive = async (task: Task) => {
        if (!token) return;
        await editTaskUtil(token, task.id, { archived: !task.archived });
        fetchTasks();
    };

    const handleDeleteTask = async (task: Task) => {
        if (!token) return;
        await deleteTaskUtil(token, task.id);
        await fetchTasks();
    };

    return (
        <div className="flex flex-col px-8 py-8 h-full overflow-y-auto">
            {!loading && (
                <div className="flex w-full justify-between gap-x-2 items-center">
                    <div className="flex items-center gap-x-3">
                        <div className="w-11 flex justify-center bg-foreground/5 items-center h-11 rounded-xl">
                            <TickCircle
                                variant="Bold"
                                size={28}
                                color={"#000"}
                            />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm -mb-1">Tasks</h4>
                            <h1 className="text-3xl font-medium">Personal</h1>
                        </div>
                    </div>
                    <div className="flex gap-x-2 items-center">
                        <Select
                            value={taskType}
                            onValueChange={(v) =>
                                setTaskType(v as "UpNext" | "Completed")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Task Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UpNext">
                                    <Timer
                                        variant="Bulk"
                                        size={18}
                                        color="#EDA224"
                                    />{" "}
                                    Up Next
                                </SelectItem>
                                <SelectItem value="Completed">
                                    <TickCircle
                                        variant="Bulk"
                                        size={18}
                                        color="#13a473"
                                    />{" "}
                                    Completed
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Dialog open={taskDialog} onOpenChange={settaskDialog}>
                            <DialogTrigger asChild>
                                <Button variant="default">Create Task</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                    Fill the provided inputs to create a task.
                                </DialogDescription>

                                <TaskForm
                                    initialTitle={newTaskName}
                                    initialPriority={newTaskPriority}
                                    onSubmit={async ({ title, priority }) => {
                                        await createTaskUtil(token!, {
                                            title,
                                            priority,
                                            userId: user!.id,
                                        });
                                        fetchTasks();
                                        settaskDialog(false);
                                        setNewTaskName("");
                                        setNewTaskPriority("MEDIUM");
                                    }}
                                />
                            </DialogContent>
                        </Dialog>

                     
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-sm justify-center h-full items-center flex">
                    <Refresh2
                        size={32}
                        color="#000"
                        variant="TwoTone"
                        className="animate-spin-ease"
                    />
                </div>
            ) : (
                <div className="h-full">
                    {filteredTasks.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Folder2
                                            variant="Bulk"
                                            size={20}
                                            color="#000"
                                        />
                                    </EmptyMedia>
                                </EmptyHeader>
                                <EmptyTitle>No Tasks Yet</EmptyTitle>
                                <EmptyDescription className="-mt-4 leading-5">
                                    You haven't created any tasks yet. <br />{" "}
                                    Get started by creating your first task.
                                </EmptyDescription>
                            </Empty>
                        </div>
                    ) : (
                        <div className="mt-8">
                            <Table className="px-3">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="p-3 text-left">
                                            Task Title
                                        </TableHead>
                                        <TableHead className="p-3 text-left">
                                            Status
                                        </TableHead>
                                        <TableHead className="p-3 text-left">
                                            Priority
                                        </TableHead>
                                        <TableHead className="p-3 text-left">
                                            Created At
                                        </TableHead>
                                        <TableHead className="p-3 text-left"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTasks.map((task) => (
                                        <TableRow
                                            key={task.id}
                                            className="h-14"
                                        >
                                            <TableCell className="px-3 font-medium">
                                                {task.title}
                                            </TableCell>
                                            <TableCell className="border-l px-3">
                                                <div
                                                    className={`flex items-center gap-x-1 w-fit font-medium ${
                                                        task.status ===
                                                        "PENDING"
                                                            ? "text-pending"
                                                            : task.status ===
                                                              "IN_PROGRESS"
                                                            ? "text-in-progress"
                                                            : "text-done"
                                                    }`}
                                                >
                                                    <RecordCircle
                                                        color={
                                                            task.status ===
                                                            "PENDING"
                                                                ? "#292929"
                                                                : task.status ===
                                                                  "IN_PROGRESS"
                                                                ? " #4e46e3"
                                                                : "#13a473"
                                                        }
                                                        variant="Bulk"
                                                        size={14}
                                                    />
                                                    {getStatus(task.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-l px-3">
                                                <div
                                                    className={`flex items-center gap-x-1 w-fit font-medium ${
                                                        task.priority === "LOW"
                                                            ? " text-low"
                                                            : task.priority ===
                                                              "MEDIUM"
                                                            ? " text-medium"
                                                            : " text-high"
                                                    }`}
                                                >
                                                    <RecordCircle
                                                        color={
                                                            task.priority ===
                                                            "LOW"
                                                                ? "#9b50d7"
                                                                : task.priority ===
                                                                  "MEDIUM"
                                                                ? " #EDA224"
                                                                : "#E93930"
                                                        }
                                                        variant="Bulk"
                                                        size={14}
                                                    />
                                                    {getPriority(task.priority)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-l px-3">
                                                <h3 className="font-medium text-foreground/60">
                                                    {formatDate(task.createdAt)}
                                                </h3>
                                            </TableCell>
                                            <TableCell className="w-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <button className="px-2 cursor-pointer py-2 rounded-lg hover:bg-muted transition">
                                                            <More
                                                                variant="Linear"
                                                                size={20}
                                                                color="#000"
                                                            />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-44"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEdit(task)
                                                            }
                                                        >
                                                            <Edit
                                                                variant="Bulk"
                                                                size={17}
                                                                color="#000"
                                                            />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                toggleArchive(
                                                                    task
                                                                )
                                                            }
                                                        >
                                                            <Archive
                                                                variant="Bulk"
                                                                size={17}
                                                                color="#000"
                                                            />
                                                            {Boolean(
                                                                (task as any)
                                                                    .archived
                                                            )
                                                                ? "Unarchive"
                                                                : "Archive"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteTask(
                                                                    task
                                                                )
                                                            }
                                                            className="text-red-500"
                                                        >
                                                            <Trash
                                                                variant="Bold"
                                                                size={17}
                                                                color="#fb2c36 "
                                                            />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Task Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Update task properties
                        </DialogDescription>
                    </DialogHeader>

                    <TaskForm
                        initialTitle={editTitle}
                        initialPriority={editPriority}
                        initialStatus={editStatus}
                        showStatus={true}
                        onCancel={() => setEditOpen(false)}
                        onSubmit={async ({ title, priority, status }) => {
                            if (!editing) return;
                            await editTaskUtil(token!, editing.id, {
                                title,
                                priority,
                                status,
                            });
                            setEditOpen(false);
                            fetchTasks();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const cookies = nookies.get(ctx);
    const token = cookies.token;

    if (!token) {
        return {
            redirect: {
                destination: "/auth/sign-in",
                permanent: false,
            },
        };
    }

    return { props: { pageTitle: "Dashboard" } };
};
