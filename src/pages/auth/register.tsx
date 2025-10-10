import Input from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Arrow, Folder2 } from "iconsax-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [loading, setloading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        try {
            setloading(true);

            e.preventDefault();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
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
                router.push("/auth/sign-in"); // redirect to protected index page
            } else {
                alert(data.message || "Account creation failed");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setloading(false);
        }
    };

    return (
        <div className="w-screen mx-auto  h-screen p-8  justify-between flex items-center ">
            <div className="md:w-full h-full relative flex justify-center ">
                <div className="w-12 h-12 rounded-xl bg-foreground absolute left-0 top-o overflow-hidden">
                    <Arrow
                        variant="Bold"
                        className="rotate-45 absolute left-0 bottom-0"
                        size={34}
                        color="#fff"
                    />
                </div>

                <form className="md:w-1/3 self-center " onSubmit={handleLogin}>
                    <div className="mb-10">
                        <h1 className="font-medium text-5xl">Create Account</h1>
                        <h3 className="text-sm font-medium mt-2 ml-1">
                            Join us today and start managing your tasks!
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
                        className="mt-4 flex items-center justify-center gap-x-3  cursor-pointer hover:bg-foreground/90 transition-all px-4 py-3 rounded-2xl bg-foreground w-full text-background"
                        type="submit"
                    >
                        {loading ? <Spinner /> : "Create Account"}
                    </button>

                    <div className="mt-6">
                        <h2 className="flex items-center gap-x-2">
                            Already have an account?{" "}
                            <div
                                onClick={() => router.push("/auth/sign-in")}
                                className="cursor-pointer text-[#FF8C00] font-medium"
                            >
                                Sign In
                            </div>
                        </h2>
                    </div>
                </form>
            </div>
        </div>
    );
}
