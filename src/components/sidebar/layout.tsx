"use client";

import { Button } from "@/components/ui/button";
import { createFolder as createFolderUtil } from "@/lib/crud";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    Add,
    ArchiveBox,
    Arrow,
    ArrowDown2,
    Folder2,
    FolderAdd,
    FolderOpen,
    Home2,
    LogoutCurve,
} from "iconsax-react";
import Cookies from "js-cookie";
import { useRouter } from "next/router"; // if you're on App Router, switch to next/navigation
import { ReactNode, useEffect, useState } from "react";
import { useFolders } from "../../../context/folder-context";
import { useUser } from "../../../context/user-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import Input from "../ui/input";
import { Separator } from "../ui/separator";

interface Folder {
    id: number;
    name: string;
    color: string;
}

interface LayoutProps {
    children: ReactNode;
    pageTitle?: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
    const { user, loading } = useUser();
    const token = Cookies.get("token");
    const router = useRouter();

    const [folderName, setFolderName] = useState("");
    const [folderColor, setFolderColor] = useState<string | null>(null);

    const { refreshFolders, folders } = useFolders();

    const [foldersOpen, setFoldersOpen] = useState<boolean>(false);
    const prefersReducedMotion = useReducedMotion();
    const [folderDialog, setfolderDialog] = useState(false);

    const colors = [
        "#FF8C00",
        "#FF6B6B",
        "#6BCB77",
        "#4D96FF",
        "#9B5DE5",
        "#FF63C3",
        "#20C997",
        "#292929",
    ];

    useEffect(() => {
        if (user?.id) {
            refreshFolders();
        }
    }, []);

    const handleCreateFolder = async () => {
        if (!user || !folderName) return;
        await createFolderUtil(token!, {
            name: folderName,
            color: folderColor ? folderColor : "#FF8C00",
            userId: user.id,
        });
        refreshFolders();
        setfolderDialog(false);
        setFolderName("");
        setFolderColor(null);
    };

    const containerVariants = {
        open: {
            height: "auto",
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 240,
                damping: 28,
                mass: 0.6,
                staggerChildren: 0.035,
            },
        },
        closed: {
            height: 0,
            opacity: prefersReducedMotion ? 0 : 0.7,
            transition: {
                type: "tween",
                duration: 0.16,
                staggerChildren: 0.025,
                staggerDirection: -1,
            },
        },
    } as const;

    const itemVariants = {
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 420, damping: 30 },
        },
        closed: {
            opacity: prefersReducedMotion ? 1 : 0,
            y: prefersReducedMotion ? 0 : -6,
            scale: prefersReducedMotion ? 1 : 0.7,
            transition: { type: "tween", duration: 0.14 },
        },
    } as const;

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("userId");
        router.push("/auth/sign-in");
    };

    const initials = user?.username
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <div className="flex h-screen overflow-y-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-background border-r pb-4 flex flex-col justify-between">
                <div className="overflow-y-auto custom-scrollbar">
                    <h1 className="text-lg border-b font-semibold h-19 px-4 flex items-center gap-x-2">
                        <div className="w-7 h-7 rounded-md bg-foreground relative overflow-hidden">
                            <Arrow
                                variant="Bold"
                                className="rotate-45 absolute left-0 bottom-0"
                                size={20}
                                color="#fff"
                            />
                        </div>
                        Productivity
                    </h1>

                    {/* Folders block */}
                    <div className="px-4 pt-8">
                        <Dialog
                            open={folderDialog}
                            onOpenChange={setfolderDialog}
                        >
                            <DialogTrigger asChild>
                                <Button className="w-full" variant="default">
                                    <FolderAdd
                                        variant="Bold"
                                        size={20}
                                        color="#fff"
                                    />
                                    Create Folder
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Folder</DialogTitle>
                                    <DialogDescription>
                                        Fill the provided inputs to create a
                                        folder.
                                    </DialogDescription>
                                    <Input
                                        onChange={(e) =>
                                            setFolderName(e.target.value)
                                        }
                                        label="Folder Name"
                                        placeholder="eg. Work"
                                    />
                                    <div className="space-y-2 mt-4">
                                        <label className="mb-1 font-medium text-foeground/80">
                                            Folder Color
                                        </label>
                                        <div className="flex gap-3 mt-1 flex-wrap">
                                            {colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() =>
                                                        setFolderColor(color)
                                                    }
                                                    className={`h-8 w-8 cursor-pointer rounded-lg border-2 transition-all ${
                                                        folderColor === color
                                                            ? "border-black scale-110"
                                                            : "border-transparent"
                                                    }`}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCreateFolder}
                                        variant="default"
                                    >
                                        Create Folder
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <h1 className="ml-2 mt-6 mb-1 font-semibold text-foreground/70">
                            Menu
                        </h1>
                        <div className="flex flex-col gap-y-1">
                            <motion.button
                                onClick={() => router.push("/")}
                                whileTap={{
                                    scale: prefersReducedMotion ? 1 : 0.98,
                                }}
                                type="button"
                                className="w-full cursor-pointer select-none rounded-xl px-3 py-3 hover:bg-muted/80 focus:outline-none  flex items-center gap-x-3"
                            >
                                <Home2 variant="Bold" size={24} color="#000" />
                                Dashboard
                            </motion.button>

                            <div>
                                <motion.button
                                    whileTap={{
                                        scale: prefersReducedMotion ? 1 : 0.98,
                                    }}
                                    type="button"
                                    onClick={() => setFoldersOpen((o) => !o)}
                                    aria-expanded={foldersOpen}
                                    className="w-full cursor-pointer select-none rounded-xl px-3 py-3 hover:bg-muted/80 flex items-center justify-between"
                                >
                                    <span className="flex cursor-pointer items-center gap-x-3 text-sm font-medium">
                                        {foldersOpen ? (
                                            <FolderOpen
                                                variant="Bulk"
                                                size={24}
                                                color="#000"
                                            />
                                        ) : (
                                            <Folder2
                                                variant="Bulk"
                                                size={24}
                                                color="#000"
                                            />
                                        )}
                                        Folders
                                    </span>
                                    <motion.span
                                        animate={{
                                            rotate: foldersOpen ? 180 : 0,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 22,
                                        }}
                                        className="inline-flex"
                                    >
                                        <ArrowDown2
                                            variant="Bold"
                                            size={18}
                                            color="#000"
                                        />
                                    </motion.span>
                                </motion.button>

                                {!loading && (
                                    <AnimatePresence initial={false}>
                                        {foldersOpen && (
                                            <motion.div
                                                key="folder-list"
                                                role="region"
                                                aria-label="Folder list"
                                                initial="closed"
                                                animate="open"
                                                exit="closed"
                                                variants={containerVariants}
                                                className={` ${
                                                    folders.length !== 0
                                                        ? "border-l-2 ms-6 ps-3 mt-1  border-foreground/40"
                                                        : "border-none mt-1 justify-center flex"
                                                }   overflow-hidden`}
                                                style={undefined}
                                            >
                                                {folders.length !== 0 ? (
                                                    <motion.ul
                                                        className="py-1 space-y-0.5"
                                                        layout
                                                    >
                                                        {folders.map(
                                                            (f: Folder) => (
                                                                <motion.li
                                                                    key={f?.id}
                                                                    variants={
                                                                        itemVariants
                                                                    }
                                                                    layout
                                                                >
                                                                    <motion.button
                                                                        onClick={() =>
                                                                            router.push(
                                                                                `/folder/${f.id}`
                                                                            )
                                                                        }
                                                                        type="button"
                                                                        whileHover={{
                                                                            x: prefersReducedMotion
                                                                                ? 0
                                                                                : 2,
                                                                        }}
                                                                        whileTap={{
                                                                            scale: prefersReducedMotion
                                                                                ? 1
                                                                                : 0.98,
                                                                        }}
                                                                        className="w-full cursor-pointer text-left text-sm px-2 py-1.5 rounded-xl hover:bg-muted/50  flex items-center justify-between"
                                                                        // onClick={() => router.push(`/folders/${f.id}`)}
                                                                    >
                                                                        <div className="flex items-center gap-x-3">
                                                                            <div
                                                                                className="h-6 w-6 rounded-md flex justify-center items-center"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        f.color +
                                                                                        "1A",
                                                                                }}
                                                                            >
                                                                                <Folder2
                                                                                    variant="Bold"
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                    color={
                                                                                        f.color
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <span className="truncate">
                                                                                {
                                                                                    f.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </motion.button>
                                                                </motion.li>
                                                            )
                                                        )}
                                                    </motion.ul>
                                                ) : (
                                                    <motion.div
                                                        className=" text-sm mt-1 mb-1 w-fit self-center font-medium text-foreground/60 flex items-center justify-between"
                                                        variants={itemVariants}
                                                    >
                                                        No Folders Yet
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>

                            <motion.button
                                onClick={() => router.push("/archive")}
                                whileTap={{
                                    scale: prefersReducedMotion ? 1 : 0.98,
                                }}
                                type="button"
                                className="w-full cursor-pointer select-none rounded-xl px-3 py-3 hover:bg-muted/80 focus:outline-none  flex items-center gap-x-3"
                            >
                                <ArchiveBox
                                    variant="Bold"
                                    size={24}
                                    color="#000"
                                />
                                Archive
                            </motion.button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-19 border-b bg-background flex items-center justify-between px-8">
                    <h2 className="text-lg font-medium">{pageTitle}</h2>

                    {user ? (
                        <div className="flex items-center gap-x-3">
                            <div className="flex items-center gap-x-4">
                                <div className="rounded-full flex justify-center font-bold text-[15px] items-center w-10 h-10 bg-foreground/10 text-foreground">
                                    {initials}
                                </div>
                                <div>
                                    <h3 className="text-md font-medium">
                                        {user?.username}
                                    </h3>
                                    <h4 className="text-xs font-medium text-foreground/80 -mt-0.5">
                                        {user?.email}
                                    </h4>
                                </div>

                                <div className="h-6 mx-3 w-[1px] bg-foreground/10"></div>

                                <Button
                                    variant="secondary"
                                    className="w-fit"
                                    onClick={handleLogout}
                                >
                                    <LogoutCurve
                                        color="red"
                                        variant="Bulk"
                                        size={18}
                                    />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto  bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
