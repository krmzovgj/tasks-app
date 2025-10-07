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
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import Input from "@/components/ui/input";
import { Folder2, Refresh2 } from "iconsax-react";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { useState } from "react";
import { useFolders } from "../../context/folder-context";
import { useUser } from "../../context/user-context";
import Cookies from "js-cookie";

export default function Home() {
    const { user, loading } = useUser();
    const { folders } = useFolders();
    const token = Cookies.get("token");

    const [folderName, setFolderName] = useState("");
    const [folderColor, setFolderColor] = useState<string | null>(null);

    const colors = [
        "#FF8C00", // Orange
        "#FF6B6B", // Red
        "#6BCB77", // Green
        "#4D96FF", // Blue
        "#9B5DE5", // Purple
        "#FF63C3", // Pink
        "#20C997", // Teal
        "#292929", //Black
    ];

    const createFolder = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/folder`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: folderName,
                        color: folderColor,
                        user: {
                            id: user?.id,
                        },
                    }),
                }
            );

            if (response.ok) {
                alert("folder created");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className=" flex flex-col h-full">
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
                <div className="h-full">
                    {folders.length === 0 ? (
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
                                <EmptyTitle>No Folders Yet</EmptyTitle>
                                <EmptyDescription className="-mt-4 leading-5">
                                    You haven't created any projects yet. <br />{" "}
                                    Get started by creating your first project.
                                </EmptyDescription>

                                <Dialog>
                                    <EmptyContent>
                                        <DialogTrigger>
                                            Create Folder
                                        </DialogTrigger>
                                    </EmptyContent>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Are you absolutely sure?
                                            </DialogTitle>
                                            <DialogDescription>
                                                This action cannot be undone.
                                                This will permanently delete
                                                your account and remove your
                                                data from our servers.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </Empty>
                        </div>
                    ) : (
                        <div className="h-full border">
                            <Dialog>
                                <DialogTrigger>Open</DialogTrigger>
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
                                            <label className="mb-1  font-medium text-foeground/80">
                                                Folder Color
                                            </label>
                                            <div className="flex gap-3 mt-1 flex-wrap">
                                                {colors.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() =>
                                                            setFolderColor(
                                                                color
                                                            )
                                                        }
                                                        className={`h-8 w-8 cursor-pointer rounded-lg border-2 transition-all ${
                                                            folderColor ===
                                                            color
                                                                ? "border-black scale-110"
                                                                : "border-transparent"
                                                        }`}
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <DialogFooter>
                                        <Button
                                            onClick={createFolder}
                                            variant="default"
                                        >
                                            Create Folder
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
            )}
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

    return {
        props: {
            pageTitle: "Dashboard",
        },
    };
};
