import { FolderOpen } from "iconsax-react";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { useUser } from "../../context/user-context";

export default function Home() {
    const { user, loading } = useUser();

    return (
        <div className="mt-20">
            {/* <h3 className="font-medium">Task List</h3> */}
            <div className="flex items-center gap-x-3">
                <div className="p-3 rounded-2xl bg-foreground/5">
                    <FolderOpen variant="Bulk" size={40} color="#FF8C00" />
                </div>

                <div>
                    <h3 className="font-medium">Tasks</h3>
                    <h1 className="text-4xl font-bold">Work</h1>
                </div>
            </div>
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

    return { props: {} };
};
