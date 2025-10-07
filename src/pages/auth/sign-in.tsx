import Input from "@/components/ui/input";
import { Folder2, FolderOpen } from "iconsax-react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Register() {
    const router = useRouter();
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch(
            "https://tasks-server-iota.vercel.app/auth/sign-in",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        const data = await res.json();

        if (res.ok) {
            Cookies.set("token", data.token, { expires: 7, path: "/" });
            Cookies.set("userId", data.user.id, {
                expires: 7,
                path: "/",
            });
            router.push("/");
        } else {
            alert(data.message || "Sign in failed");
        }
    };

    return (
        <div className="w-screen mx-auto h-screen p-8  justify-between flex items-center ">
            <div className="md:w-1/2 h-full relative flex justify-center  md:mr-8">
                <div className="absolute left-0 top-0  h-fit">
                    <Folder2 variant="Bulk" size={50} color="#FF8C00" />
                </div>

                <form className=" md:w-2/3 self-center " onSubmit={handleLogin}>
                    <div className="mb-10">
                        <h1 className="font-medium text-5xl">Get Started</h1>
                        <h3 className="text-sm font-medium mt-2 ml-1">
                            Enter your credentials to access your account
                        </h3>
                    </div>

                    <Input
                        label="Email address"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="mt-4  cursor-pointer hover:bg-foreground/90 transition-all px-4 py-3 rounded-2xl bg-foreground w-full text-background"
                        type="submit"
                    >
                        Sign In
                    </button>

                    <div className="mt-6">
                        <h2 className="flex items-center gap-x-2">
                            Don't have an account?{" "}
                            <div
                                onClick={() => router.push("/auth/register")}
                                className="cursor-pointer text-[#FF8C00] font-medium"
                            >
                                Register
                            </div>
                        </h2>
                    </div>
                </form>
            </div>

            <div className="w-1/2 rounded-4xl border bg-foreground flex-col h-full flex justify-center items-center">
                <FolderOpen
                    variant="Bulk"
                    size={120}
                    className="rotate-20"
                    color="#FF8C00"
                />
                <h1 className="mt-10 text-6xl text-background  text-center">
                    The simplest way to manage your work
                </h1>
            </div>
        </div>
    );
}
