const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        redirect: "/login", // Redirect root to login if not specified
      },
      {
        path: "login",
        component: () => import("pages/UserLogin.vue"),
      },
      {
        path: "signup",
        component: () => import("pages/UserSignup.vue"),
      },
      {
        path: "portfolio",
        component: () => import("pages/UserPortfolio.vue"),
        meta: { requiresAuth: true }, // Requires user to be authenticated
      },
      {
        path: "market",
        component: () => import("pages/CryptoMarket.vue"),
        meta: { requiresAuth: true }, // Requires user to be authenticated
      },
      {
        path: "ai-consultant",
        component: () => import("pages/AIConsultant.vue"),
        meta: { requiresAuth: true }, // Requires user to be authenticated
      },
      {
        path: "reset-password",
        component: () => import("pages/UserResetPassword.vue"), // Add the reset password page
      },
    ],
  },
  // Catch-all route for non-existent pages
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
