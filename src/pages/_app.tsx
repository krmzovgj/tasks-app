import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../../context/user-context";
import { FolderProvider } from "../../context/folder-context";
import Layout from "@/components/sidebar/layout";

export default function App({ Component, pageProps, router }: AppProps) {
    const noLayout = router.pathname.startsWith("/auth");

    return (
        <UserProvider>
            <FolderProvider>
                {noLayout ? (
                    <Component {...pageProps} />
                ) : (
                    <Layout pageTitle={pageProps.pageTitle}>
                        <Component {...pageProps} />
                    </Layout>
                )}
            </FolderProvider>
        </UserProvider>
    );
}
