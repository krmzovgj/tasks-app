import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import Input from "@/components/ui/input";
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
import { Priority, Status, Task } from "@/styles/models";
import {
    Archive,
    Edit,
    Folder2,
    More,
    RecordCircle,
    Refresh2,
    TickCircle,
    Trash,
} from "iconsax-react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useFolders } from "../../../context/folder-context";
import { useUser } from "../../../context/user-context";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, getPriority, getStatus } from "@/lib/utils";

type FetchOpts = { signal?: AbortSignal; silent?: boolean };

const Folder = () => {
    const router = useRouter();
    const { isReady, query } = router;
    const id = query.id as string | undefined;

    const { folders } = useFolders();
    const token = Cookies.get("token");

    const folder = folders.find((f) => String(f?.id) === String(id));

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Create dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>("LOW");

    // Edit dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editPriority, setEditPriority] = useState<Priority>("LOW");
    const [editStatus, setEditStatus] = useState<Status>("PENDING");
    const [editArchived, setEditArchived] = useState<boolean>(false);

    // Filters (client-side)
    const [filterPriority, setFilterPriority] = useState<"ALL" | Priority>(
        "ALL"
    );
    const [filterStatus, setFilterStatus] = useState<"ALL" | Status>("ALL");

    // Track the latest id to ignore stale responses
    const latestIdRef = useRef<string | undefined>(undefined);

    // Keep an abort controller for silent refetches to avoid overlap
    const silentControllerRef = useRef<AbortController | null>(null);

    const pendingTasks: Task[] = tasks.filter(
        (task) => task.status === "PENDING"
    );
    const inProgressTasks: Task[] = tasks.filter(
        (task) => task.status === "IN_PROGRESS"
    );
    const doneTasks: Task[] = tasks.filter((task) => task.status === "DONE");

    const fetchTasks = async (folderId: string, opts: FetchOpts = {}) => {
        const { signal, silent } = opts;

        try {
            const res = await fetch(
                `${
                    process.env.NEXT_PUBLIC_BACKEND_URL
                }/task?folderId=${encodeURIComponent(folderId)}&archived=false`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                    signal,
                }
            );

            if (latestIdRef.current !== folderId) return;

            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            } else {
                setTasks([]);
            }
        } catch (e: any) {
            if (e?.name !== "AbortError") {
                console.error(e);
                setTasks([]);
            }
        } finally {
            if (!silent && latestIdRef.current === folderId) setLoading(false);
        }
    };

    useEffect(() => {
        if (!isReady || !id) return;

        setTasks([]);
        setLoading(true);

        const controller = new AbortController();
        latestIdRef.current = id;
        fetchTasks(id, { signal: controller.signal, silent: false });

        return () => controller.abort();
    }, [isReady, id, token]);

    const refetchSilent = () => {
        if (!id) return;
        if (silentControllerRef.current) {
            silentControllerRef.current.abort();
        }
        const controller = new AbortController();
        silentControllerRef.current = controller;
        latestIdRef.current = id;
        fetchTasks(id, { signal: controller.signal, silent: true });
    };

    const createTask = async () => {
        if (!newTaskName || !id) return;
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/task`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newTaskName,
                        description: "",
                        priority: newTaskPriority,
                        folderId: id,
                    }),
                }
            );

            if (response.ok) {
                setDialogOpen(false);
                setNewTaskName("");
                setNewTaskPriority("LOW");
                refetchSilent();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const openEdit = (task: Task) => {
        setEditing(task);
        setEditTitle(task.title ?? "");
        setEditPriority((task.priority as Priority) ?? "LOW");
        setEditStatus((task.status as Status) ?? "PENDING");
        setEditArchived(Boolean((task as any).archived));
        setEditOpen(true);
    };

    const updateTask = async () => {
        if (!editing || !id) return;

        const payload = {
            title: editTitle,
            description: "",
            status: editStatus,
            priority: editPriority,
            folderId: Number(id),
            archived: editArchived,
        };

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${editing.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (res.ok) {
                setEditOpen(false);
                setEditing(null);
                refetchSilent();
            } else {
                const err = await res.json().catch(() => ({}));
                console.error("Update failed", err);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleArchive = async (task: Task) => {
        if (!id) return;
        try {
            const payload = {
                title: task.title ?? "",
                description: "",
                status: (task.status as Status) ?? "PENDING",
                priority: (task.priority as Priority) ?? "LOW",
                folderId: Number(id),
                archived: !Boolean((task as any).archived),
            };

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${task.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (res.ok) {
                refetchSilent();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTask = async (task: Task) => {
        if (!id) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${task.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ folderId: Number(id) }),
                }
            );
            if (res.ok) {
                refetchSilent();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filtered list
    const visibleTasks = tasks.filter((t) => {
        const priorityOk =
            filterPriority === "ALL"
                ? true
                : (t.priority as Priority) === filterPriority;
        const statusOk =
            filterStatus === "ALL"
                ? true
                : (t.status as Status) === filterStatus;
        return priorityOk && statusOk;
    });

    const clearFilters = () => {
        setFilterPriority("ALL");
        setFilterStatus("ALL");
    };

    return (
        <Dialog
            key={id || "no-id"}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
        >
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
                                variant="Bulk"
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
                    <div className="flex items-center  gap-x-3">
                        <div className="flex items-center mr-3 gap-x-3">
                            <div className="flex items-center text-sm gap-x-1">
                                <RecordCircle
                                    variant="Bulk"
                                    size={16}
                                    color="#292929"
                                />
                                <div className="flex items-center gap-x-2 text-foreground/80">
                                    Pending{" "}
                                    <h2 className="font-semibold text-foreground">
                                        {pendingTasks.length}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mr-3 gap-x-3">
                            <div className="flex items-center text-sm gap-x-1">
                                <RecordCircle
                                    variant="Bulk"
                                    size={16}
                                    color="#4e46e3"
                                />
                                <div className="flex items-center gap-x-2 text-foreground/80">
                                    In Progress{" "}
                                    <h2 className="font-semibold text-foreground">
                                        {inProgressTasks.length}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mr-3 gap-x-3">
                            <div className="flex items-center text-sm gap-x-1">
                                <RecordCircle
                                    variant="Bulk"
                                    size={16}
                                    color="#13a473"
                                />
                                <div className="flex items-center gap-x-2 text-foreground/80">
                                    Done{" "}
                                    <h2 className="font-semibold text-foreground">
                                        {doneTasks.length}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        {/* Priority */}
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
                                <SelectItem value="LOW">
                                    <RecordCircle
                                        variant="Bulk"
                                        size={18}
                                        color="#9b50d7"
                                    />
                                    Low
                                </SelectItem>
                                <SelectItem value="MEDIUM">
                                    <RecordCircle
                                        variant="Bulk"
                                        size={18}
                                        color="#EDA224"
                                    />
                                    Medium
                                </SelectItem>
                                <SelectItem value="HIGH">
                                    <RecordCircle
                                        variant="Bulk"
                                        size={18}
                                        color="#E93930"
                                    />
                                    High
                                </SelectItem>
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
                                <SelectItem value="PENDING">
                                    <RecordCircle
                                        variant="Bulk"
                                        size={18}
                                        color="#292929"
                                    />
                                    Pending
                                </SelectItem>
                                <SelectItem value="IN_PROGRESS">
                                    <RecordCircle
                                        variant="Bulk"
                                        size={18}
                                        color="#4e46e3"
                                    />
                                    In Progress
                                </SelectItem>
                                <SelectItem value="DONE">
                                    <RecordCircle
                                        variant="Bulk"
                                        size={18}
                                        color="#13a473"
                                    />
                                    Done
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {filterPriority === "ALL" &&
                        filterStatus === "ALL" ? null : (
                            <Button
                                variant="ghost"
                                className="hidden sm:inline-flex"
                                onClick={clearFilters}
                                disabled={
                                    filterPriority === "ALL" &&
                                    filterStatus === "ALL"
                                }
                                title="Reset filters"
                            >
                                Clear
                            </Button>
                        )}

                        {/* Create Task */}
                        <DialogTrigger asChild>
                            <Button variant="default">Create Task</Button>
                        </DialogTrigger>
                    </div>

                    {/* Create Task Modal */}
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                            <DialogDescription>
                                Add a task to folder {folder?.name || id}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Task Name
                                </label>
                                <Input
                                    placeholder="Enter task name"
                                    value={newTaskName}
                                    onChange={(e) =>
                                        setNewTaskName(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Priority
                                </label>
                                <Select
                                    value={newTaskPriority}
                                    onValueChange={(v) =>
                                        setNewTaskPriority(
                                            v as "LOW" | "MEDIUM" | "HIGH"
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#9b50d7"
                                            />
                                            Low
                                        </SelectItem>
                                        <SelectItem value="MEDIUM">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#EDA224"
                                            />
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="HIGH">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#E93930"
                                            />
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button onClick={createTask}>Create Task</Button>
                        </DialogFooter>
                    </DialogContent>
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
                ) : visibleTasks.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <TickCircle
                                    variant="Bulk"
                                    size={20}
                                    color="#000"
                                />
                            </EmptyMedia>
                        </EmptyHeader>
                        <EmptyTitle>No Tasks Yet</EmptyTitle>
                        <EmptyDescription className="-mt-4 leading-5">
                            You haven't created any tasks yet. <br />
                            Get started by creating your first task in{" "}
                            {folder?.name || id}.
                        </EmptyDescription>
                        <DialogTrigger asChild>
                            <Button>Create Task</Button>
                        </DialogTrigger>
                    </Empty>
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
                                {visibleTasks.map((task) => (
                                    <TableRow key={task.id} className="h-14">
                                        <TableCell className="px-3 font-medium">
                                            {task.title}
                                        </TableCell>

                                        <TableCell className="border-l px-3">
                                            <div
                                                className={`flex items-center gap-x-1 w-fit font-medium  ${
                                                    task.status === "PENDING"
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
                                                className={`flex items-center gap-x-1 w-fit font-medium  ${
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
                                                        task.priority === "LOW"
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
                                                <DropdownMenuTrigger asChild>
                                                    <button className="px-2 cursor-pointer py-1 rounded-md hover:bg-muted transition">
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
                                                        className="text-red-500"
                                                        onClick={() =>
                                                            deleteTask(task)
                                                        }
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

            {/* Edit Task Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Update task properties
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Title
                            </label>
                            <Input
                                placeholder="Task title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Status
                                </label>
                                <Select
                                    value={editStatus}
                                    onValueChange={(v) =>
                                        setEditStatus(v as Status)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#292929"
                                            />
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="IN_PROGRESS">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#4e46e3"
                                            />
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="DONE">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#13a473"
                                            />
                                            Done
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Priority
                                </label>
                                <Select
                                    value={editPriority}
                                    onValueChange={(v) =>
                                        setEditPriority(v as Priority)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#9b50d7"
                                            />
                                            Low
                                        </SelectItem>
                                        <SelectItem value="MEDIUM">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#EDA224"
                                            />
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="HIGH">
                                            <RecordCircle
                                                variant="Bulk"
                                                size={18}
                                                color="#E93930"
                                            />
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setEditOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={updateTask}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default Folder;
