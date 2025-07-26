import { createRoute } from '@tanstack/react-router'
import AuthPage from './../pages/AuthPage.jsx'
import RegisterPage from './../pages/RegisterPage.jsx'

// This will be set by the routeTree.js file
let parentRoute = null;

export const setParentRoute = (route) => {
  parentRoute = route;
};

export const authRoute = createRoute({
  getParentRoute: () => parentRoute,
  path: '/auth',
  component: AuthPage
})

export const registerRoute = createRoute({
  getParentRoute: () => parentRoute,
  path: '/register',
  component: RegisterPage
})