import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import { useFolders } from "../../../context/folder-context";
import { useUser } from "../../../context/user-context";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty";
import {
    RecordCircle,
    Folder2,
    TickCircle,
    More,
    Edit,
    Archive,
    Trash,
    Refresh2,
    Setting,
    Setting2,
} from "iconsax-react";
import TaskForm from "@/components/ui/task-form";

import { Priority, Status, Task } from "@/styles/models";
import {
    fetchTasks as fetchTasksUtil,
    createTask as createTaskUtil,
    editTask as editTaskUtil,
    deleteTask as deleteTaskUtil,
    deleteFolder,
} from "@/lib/crud";
import { formatDate, getPriority, getStatus } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const Folder = () => {
    const router = useRouter();
    const { isReady, query } = router;
    const id = query.id as string | undefined;

    const { user } = useUser();
    const { folders, refreshFolders } = useFolders();
    const token = Cookies.get("token");

    const folder = folders.find((f) => String(f?.id) === String(id));
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Task Dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>("MEDIUM");

    // Edit Task Dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editPriority, setEditPriority] = useState<Priority>("LOW");
    const [editStatus, setEditStatus] = useState<Status>("PENDING");
    const [editArchived, setEditArchived] = useState(false);

    const latestIdRef = useRef<string | undefined>(undefined);

    const fetchTasks = async (folderId: string | undefined) => {
        if (!token || !user) return;
        latestIdRef.current = folderId;

        const data = await fetchTasksUtil(token, user.id, Number(folderId));
        if (latestIdRef.current === folderId) {
            setTasks(data);
        }
    };

    useEffect(() => {
        try {
            setLoading(true);
            if (!isReady || !id || !user?.id) return;
            fetchTasks(id);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [isReady, id, user?.id, token]);

    // CRUD Functions
    const createTask = async ({
        title,
        priority,
    }: {
        title: string;
        priority: Priority;
    }) => {
        if (!token || !user) return;
        await createTaskUtil(token, {
            title,
            priority,
            userId: user.id,
            folderId: Number(id),
        });
        setCreateOpen(false);
        setNewTaskName("");
        setNewTaskPriority("MEDIUM");
        fetchTasks(id!);
    };

    const openEditTask = (task: Task) => {
        setEditing(task);
        setEditTitle(task.title ?? "");
        setEditPriority(task.priority ?? "LOW");
        setEditStatus(task.status ?? "PENDING");
        setEditArchived(Boolean((task as any).archived));
        setEditOpen(true);
    };

    const updateTask = async ({
        title,
        priority,
        status,
    }: {
        title: string;
        priority: Priority;
        status?: Status;
    }) => {
        if (!token || !editing) return;
        await editTaskUtil(token, editing.id, {
            title,
            priority,
            status,
            archived: editArchived,
            userId: user?.id, // Include archived
        });
        setEditOpen(false);
        setEditing(null);
        fetchTasks(id!);
    };

    const toggleArchive = async (task: Task) => {
        if (!token) return;
        await editTaskUtil(token, task.id, {
            title: task.title,
            priority: task.priority,
            status: task.status,
            archived: !task.archived,
        });
        fetchTasks(id!);
    };

    const deleteTask = async (task: Task) => {
        if (!token) return;
        await deleteTaskUtil(token, task.id);
        fetchTasks(id!);
    };

    // Filters (priority & status)
    const [filterPriority, setFilterPriority] = useState<"ALL" | Priority>(
        "ALL"
    );
    const [filterStatus, setFilterStatus] = useState<"ALL" | Status>("ALL");

    const visibleTasks = tasks.filter((t) => {
        const priorityOk =
            filterPriority === "ALL" ? true : t.priority === filterPriority;
        const statusOk =
            filterStatus === "ALL" ? true : t.status === filterStatus;
        return priorityOk && statusOk;
    });

    const clearFilters = () => {
        setFilterPriority("ALL");
        setFilterStatus("ALL");
    };

    const statusOptions: { value: Status; color: string }[] = [
        { value: "PENDING", color: "#292929" },
        { value: "IN_PROGRESS", color: "#4e46e3" },
        { value: "DONE", color: "#13a473" },
    ];

    const priorityOptions: { value: Priority; color: string }[] = [
        { value: "LOW", color: "#9b50d7" },
        { value: "MEDIUM", color: "#EDA224" },
        { value: "HIGH", color: "#E93930" },
    ];

    return (
        <div className="flex flex-col px-8 py-8 h-full overflow-y-auto">
            {!loading && (
                <div className="flex w-full justify-between items-center">
                    <div className="flex items-center gap-x-3">
                        <div
                            className="w-11 flex justify-center items-center h-11 rounded-xl"
                            style={{
                                backgroundColor:
                                    (folder?.color || "#000") + "1A",
                            }}
                        >
                            <Folder2
                                variant="Bold"
                                size={28}
                                color={folder?.color || "#000"}
                            />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm -mb-1">Tasks</h4>
                            <h1 className="text-3xl font-medium">
                                {folder?.name || "Folder"}
                            </h1>
                        </div>
                    </div>

                    {/* Filters + Create */}
                    <div className="flex items-center gap-x-3">
                        {statusOptions.map((s) => {
                            const count = tasks.filter(
                                (t) => t.status === s.value
                            ).length;
                            return (
                                <div
                                    key={s.value}
                                    className="flex items-center text-sm gap-x-1"
                                >
                                    <RecordCircle
                                        variant="Bulk"
                                        size={16}
                                        color={s.color}
                                    />
                                    <div className="flex items-center gap-x-2 text-foreground/80">
                                        {getStatus(s.value)}
                                        <h2 className="font-semibold text-foreground">
                                            {count}
                                        </h2>
                                    </div>
                                </div>
                            );
                        })}

                        <Select
                            value={filterPriority}
                            onValueChange={(v) =>
                                setFilterPriority(v as "ALL" | Priority)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    All Priorities
                                </SelectItem>
                                {priorityOptions.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        <RecordCircle
                                            variant="Bulk"
                                            size={18}
                                            color={p.color}
                                        />{" "}
                                        {getPriority(p.value)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filterStatus}
                            onValueChange={(v) =>
                                setFilterStatus(v as "ALL" | Status)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    All Statuses
                                </SelectItem>
                                {statusOptions.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        <RecordCircle
                                            variant="Bulk"
                                            size={18}
                                            color={s.color}
                                        />{" "}
                                        {getStatus(s.value)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <AlertDialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-fit p-2"
                                    >
                                        <Setting2
                                            variant="Linear"
                                            size={20}
                                            color="#000"
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                    // onClick={() => openEditTask(task)}
                                    >
                                        <Edit
                                            variant="Bulk"
                                            size={17}
                                            color="#000"
                                        />{" "}
                                        Edit Folder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        className="text-red-500"
                                        onClick={() =>
                                            setDeleteDialogOpen(true)
                                        }
                                    >
                                        <Trash
                                            variant="Bulk"
                                            size={17}
                                            color="#000"
                                        />{" "}
                                        Delete Folder
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the folder
                                        and all its tasks.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end gap-2 mt-4">
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        onClick={async () => {
                                            await router.push("/");
                                            await deleteFolder(
                                                token!,
                                                id!,
                                                user?.id!
                                            );
                                            refreshFolders();
                                        }}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>

                        {(filterPriority !== "ALL" ||
                            filterStatus !== "ALL") && (
                            <Button variant="ghost" onClick={clearFilters}>
                                Clear
                            </Button>
                        )}

                        {/* Create Task */}
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>Create Task</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                </DialogHeader>
                                <TaskForm
                                    initialTitle={newTaskName}
                                    initialPriority={newTaskPriority}
                                    onSubmit={createTask}
                                    onCancel={() => setCreateOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}

            {/* Task Table / Empty */}
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <Refresh2
                        size={32}
                        color="#000"
                        variant="TwoTone"
                        className="animate-spin-ease"
                    />
                </div>
            ) : visibleTasks.length === 0 ? (
                <Empty className="mt-8">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <TickCircle color="#000" variant="Bulk" size={20} />
                        </EmptyMedia>
                    </EmptyHeader>
                    <EmptyTitle>
                        {tasks.length === 0
                            ? "No Tasks Yet"
                            : "No Results Found"}
                    </EmptyTitle>
                    {filterPriority !== "ALL" || filterStatus !== "ALL" ? (
                        <EmptyDescription className="-mt-5">
                            No tasks found with the selected filters
                        </EmptyDescription>
                    ) : (
                        <EmptyDescription className="-mt-5">
                            You haven't created any tasks yet. <br /> Get
                            started by creating your first task.
                        </EmptyDescription>
                    )}
                </Empty>
            ) : (
                <Table className="mt-8">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleTasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>
                                    <div
                                        className={`flex items-center gap-x-1 w-fit font-medium ${
                                            task.status === "PENDING"
                                                ? "text-pending"
                                                : task.status === "IN_PROGRESS"
                                                ? "text-in-progress"
                                                : "text-done"
                                        }`}
                                    >
                                        <RecordCircle
                                            color={
                                                task.status === "PENDING"
                                                    ? "#292929"
                                                    : task.status ===
                                                      "IN_PROGRESS"
                                                    ? "#4e46e3"
                                                    : "#13a473"
                                            }
                                            variant="Bulk"
                                            size={14}
                                        />{" "}
                                        {getStatus(task.status)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className={`flex items-center gap-x-1 w-fit font-medium ${
                                            task.priority === "LOW"
                                                ? "text-low"
                                                : task.priority === "MEDIUM"
                                                ? "text-medium"
                                                : "text-high"
                                        }`}
                                    >
                                        <RecordCircle
                                            color={
                                                task.priority === "LOW"
                                                    ? "#9b50d7"
                                                    : task.priority === "MEDIUM"
                                                    ? "#EDA224"
                                                    : "#E93930"
                                            }
                                            variant="Bulk"
                                            size={14}
                                        />{" "}
                                        {getPriority(task.priority)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatDate(task.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="px-2 cursor-pointer py-2 rounded-lg hover:bg-muted transition">
                                                <More
                                                    variant="Linear"
                                                    size={20}
                                                    color="#000"
                                                />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    openEditTask(task)
                                                }
                                            >
                                                <Edit
                                                    variant="Bulk"
                                                    size={17}
                                                    color="#000"
                                                />{" "}
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    toggleArchive(task)
                                                }
                                            >
                                                <Archive
                                                    variant="Bulk"
                                                    size={17}
                                                    color="#000"
                                                />{" "}
                                                {task.archived
                                                    ? "Unarchive"
                                                    : "Archive"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-500"
                                                onClick={() => deleteTask(task)}
                                            >
                                                <Trash
                                                    variant="Bulk"
                                                    size={17}
                                                    color="#000"
                                                />{" "}
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Edit Task Dialog */}
            {editing && (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
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
                                fetchTasks(id);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default Folder;
