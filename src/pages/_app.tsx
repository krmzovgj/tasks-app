import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../../context/user-context";
import Layout from "@/components/sidebar/layout";

export default function App({ Component, pageProps, router }: AppProps) {
  const noLayout = router.pathname.startsWith("/auth");

  return (
    <UserProvider>
      {noLayout ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </UserProvider>
  );
}
