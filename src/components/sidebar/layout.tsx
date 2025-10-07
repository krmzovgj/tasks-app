"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArchiveBox,
    ArrowDown2,
    Folder2,
    FolderOpen,
    Home2,
    LogoutCurve,
} from "iconsax-react";
import Cookies from "js-cookie";
import { useRouter } from "next/router"; // if you're on App Router, switch to next/navigation
import { ReactNode, useEffect, useState } from "react";
import { useFolders } from "../../../context/folder-context";
import { useUser } from "../../../context/user-context";

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
    const { refreshFolders, folders } = useFolders();

    const router = useRouter();
    const [foldersOpen, setFoldersOpen] = useState<boolean>(false);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        refreshFolders();
    }, []);

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
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-background border-r pb-4 flex flex-col justify-between">
                <div>
                    <h1 className="text-lg border-b font-semibold h-19 px-4 flex items-center gap-x-2">
                        Productivity
                    </h1>

                    {/* Folders block */}
                    <div className="px-4 overflow-y-auto mt-8">
                        <h1 className="ml-2 mb-2 font-semibold text-foreground/70">
                            Menu
                        </h1>
                        <div className="flex flex-col gap-y-2">
                            <motion.button
                                onClick={() => router.push("/")}
                                whileTap={{
                                    scale: prefersReducedMotion ? 1 : 0.98,
                                }}
                                type="button"
                                className="w-full cursor-pointer select-none rounded-xl px-3 py-3 hover:bg-muted/60 bg-muted/80 focus:outline-none  flex items-center gap-x-3"
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
                                    className="w-full cursor-pointer select-none rounded-xl px-3 py-3 hover:bg-muted/60 bg-muted/80 flex items-center justify-between"
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
                                                className="ms-6 ps-3 mt-1 border-l-2 border-foreground/40   overflow-hidden"
                                                style={undefined}
                                            >
                                                <motion.ul
                                                    className="py-1  space-y-0.5"
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
                                                                    className="w-full cursor-pointer text-left text-sm px-2 py-1.5 rounded-xl hover:bg-muted/50 flex items-center justify-between"
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
                                className="w-full cursor-pointer select-none rounded-xl px-3 py-3 hover:bg-muted/60 bg-muted/80 focus:outline-none  flex items-center gap-x-3"
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

                <div className="px-4">
                    <Button
                        variant="secondary"
                        className="w-full  cursor-pointer mt-auto"
                        onClick={handleLogout}
                    >
                        <LogoutCurve
                            variant="Linear"
                            size={18}
                            color="#fb2c36"
                        />{" "}
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-19 border-b bg-background flex items-center justify-between px-8">
                    <h2 className="text-lg font-medium">{pageTitle}</h2>

                    {user ? (
                        <div className="flex items-center gap-x-3">
                            <div className="rounded-full flex justify-center font-bold text-[15px] items-center w-10 h-10 bg-[#FF8C00]/10 text-[#FF8C00]">
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
                        </div>
                    ) : null}
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto px-8 py-8 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
