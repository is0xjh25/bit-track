import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { supabase } from "../supabaseClient";

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE || "/"),
  });

  // Define the Base URL from environment variable
  const BASE_URL = process.env.VUE_APP_BASE_URL || "http://localhost:9000";

  // Authentication Guard with Infinite Redirect Prevention
  Router.beforeEach(async (to, from, next) => {
    const fullHash = (window.location.href.split("#")[1] || "").replace(
      /^\//,
      ""
    );

    // Manually parse the access_token and type
    let accessToken = null;
    let refreshToken = null;
    let type = null;

    fullHash.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      if (key === "access_token") {
        accessToken = value;
      } else if (key === "refresh_token") {
        refreshToken = value;
      } else if (key === "type") {
        type = value;
      }
    });

    // Redirect to reset-password page if access_token is present, only if not already there
    if (accessToken && type === "recovery" && to.path !== "/reset-password") {
      return next({
        path: "/reset-password",
        query: { access_token: accessToken, refresh_token: refreshToken },
      });
    }

    // Check if route requires authentication or is login/signup
    if (
      to.meta.requiresAuth ||
      to.path === "/login" ||
      to.path === "/signup" ||
      to.path === "/reset-password"
    ) {
      const { data } = await supabase.auth.getSession();
      const isLoggedIn = !!data.session;

      // Redirect to login if trying to access a protected route without being logged in
      if (to.meta.requiresAuth && !isLoggedIn) {
        return next("/login");
      }

      // Redirect to portfolio if logged in and trying to access login or signup
      if ((to.path === "/login" || to.path === "/signup") && isLoggedIn) {
        return next("/portfolio");
      }
    }

    // Proceed if no conditions triggered a redirect
    next();
  });

  return Router;
});
