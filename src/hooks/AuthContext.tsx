import Router from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/apiClient";
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
  // signIn(credentials: SignInCredentintails): Promise<void>;
  // signOut(): void;
  signIn: (credentials: SignInCredentintails) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
};

type AuthContextProviderProps = {
  children: ReactNode;
};
let authChannel: BroadcastChannel;

const AuthContext = createContext({} as AuthContextType);
export function signOut() {
  destroyCookie(undefined, "@auth-app.token");
  destroyCookie(undefined, "@auth-app.refreshToken");
  authChannel.postMessage("signout");
  Router.push("/");
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User>(null);
  useEffect(() => {
    authChannel = new BroadcastChannel("auth");
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signout":
          Router.push("/");

          break;
        case "signin":
          Router.push("/dashboard");
          break;

        default:
          break;
      }
    };
  }, []);
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

      authChannel.postMessage("signin");
    } catch (err) {
      console.log(err);
    }
  }
  const isAuthenticated = !!user;
  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const session = useContext(AuthContext);
  return session;
}
