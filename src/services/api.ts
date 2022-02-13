import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../hooks/AuthContext";

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["@auth-app.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        cookies = parseCookies();
        const { "@auth-app.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config;
        if (!isRefreshing) {
          isRefreshing = true;
          api
            .post("/refresh", { refreshToken })
            .then((response) => {
              const { token, refreshToken: newRefreshToken } = response.data;
              setCookie(undefined, "@auth-app.token", token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
              });
              setCookie(undefined, "@auth-app.refreshToken", newRefreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
              });
              api.defaults.headers["Authorization"] = `Bearar ${token}`;
              failedRequestQueue.forEach((request) => {
                request.onSuccess(token);
              });
              failedRequestQueue = [];
            })
            .catch((error) => {
              failedRequestQueue.forEach((request) => {
                request.onFailure(error);
              });
              failedRequestQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(originalConfig));
            },
            onFailure: (error: AxiosError) => {
              reject(error);
            },
          });
        });
      } else {
        signOut();
      }
    }
    return Promise.reject(error);
  }
);
