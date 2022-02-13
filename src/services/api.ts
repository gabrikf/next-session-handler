import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../hooks/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);
  const api = axios.create({
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
          cookies = parseCookies(ctx);
          const { "@auth-app.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config;
          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post("/refresh", { refreshToken })
              .then((response) => {
                const { token, refreshToken: newRefreshToken } = response.data;
                setCookie(ctx, "@auth-app.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });
                setCookie(ctx, "@auth-app.refreshToken", newRefreshToken, {
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
                if (process.browser) {
                  signOut();
                }
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
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return api;
}
