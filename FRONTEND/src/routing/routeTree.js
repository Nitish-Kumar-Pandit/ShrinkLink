import { createRootRoute } from '@tanstack/react-router'
import RootLayout from './../RouteLayout.jsx';
import { homeRoute } from './homePage.js';
import { authRoute } from './auth.route.js';
import { dashboardRoute } from './dashboard.js';

export const rootRoute = createRootRoute({
  component: RootLayout
})

export const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute, 
    dashboardRoute
])