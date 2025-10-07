"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import Cookies from "js-cookie";

interface User {
    id: number;
    username: string;
    email: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    loading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    console.log(process.env.NEXT_PUBLIC_BACKEND_URL)

    useEffect(() => {
        const token = Cookies.get("token");
        const userId = Cookies.get("userId");
        if (!token || !userId) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
