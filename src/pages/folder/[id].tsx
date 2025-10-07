import { Task } from "@/models";
import { Add, Folder2, FolderOpen, Refresh2, TickCircle } from "iconsax-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../../context/user-context";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { useFolders } from "../../../context/folder-context";
import { GetServerSideProps } from "next";
import nookies from "nookies";

const Folder = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useUser();
    const { folders } = useFolders();
    const token = Cookies.get("token");

    console.log(folders);

    const folder = folders.find((folder) => String(folder?.id) === id);
    console.log(id)

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/task?folderId=${String(id)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className=" flex flex-col h-full">
            <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-x-3">
                    <div
                        className="w-11 flex justify-center items-center h-11 rounded-xl"
                        style={{ backgroundColor: folder?.color + "1A" }}
                    >
                        <Folder2
                            variant="Bulk"
                            size={28}
                            color={folder?.color}
                        />
                    </div>
                    <h1 className="text-3xl font-medium">{folder?.name}</h1>
                </div>

                <Button variant="default">Create Folder</Button>
            </div>

            {loading ? (
                <div className="text-sm  justify-center h-full items-center flex">
                    <Refresh2
                        size={32}
                        color="#000"
                        variant="TwoTone"
                        className="animate-spin-ease"
                    />
                </div>
            ) : (
                <div className="h-full flex justify-center items-center">
                    {tasks.length === 0 ? (
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
                                You haven't created any tasks yet. <br /> Get
                                started by creating your first task.
                            </EmptyDescription>
                            <EmptyContent>
                                <Button>Create Task</Button>
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <div className="mt-20">
                            {/* <h3 className="font-medium">Task List</h3> */}
                            <div className="flex items-center gap-x-3">
                                <div className="p-3 rounded-2xl bg-foreground/5">
                                    <FolderOpen
                                        variant="Bulk"
                                        size={40}
                                        color="#FF8C00"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-medium">Tasks</h3>
                                    <h1 className="text-4xl font-bold">Work</h1>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Folder;

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

    return {
        props: {
            pageTitle: "Folder",
        },
    };
};
