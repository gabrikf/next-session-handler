import Router from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/api";
import { destroyCookie, parseCookies, setCookie } from "nookies";
type SignInCredentintails = {
  email: string;
  password: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type AuthContextType = {
  signIn(credentials: SignInCredentintails): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextType);
export function signOut() {
  destroyCookie(undefined, "@auth-app.token");
  destroyCookie(undefined, "@auth-app.refreshToken");
  Router.push("/");
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const { "@auth-app.token": token } = parseCookies();
    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentintails) {
    try {
      const response = await api.post("/sessions", { email, password });
      const { permissions, roles, token, refreshToken } = response.data;
      setCookie(undefined, "@auth-app.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      setCookie(undefined, "@auth-app.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers["Authorization"] = `Bearar ${token}`;
      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }
  const isAuthenticated = !!user;
  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const session = useContext(AuthContext);
  return session;
}
