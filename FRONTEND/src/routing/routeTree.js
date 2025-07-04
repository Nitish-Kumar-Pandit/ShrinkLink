import { createRootRoute } from '@tanstack/react-router'
import RootLayout from './../RouteLayout.jsx';
import { homeRoute } from './homePage.js';
import { authRoute, registerRoute } from './auth.route.js';
import { dashboardRoute } from './dashboard.js';
import { analyticsDemoRoute } from './analyticsDemo.js';

export const rootRoute = createRootRoute({
  component: RootLayout
})

export const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    registerRoute,
    dashboardRoute,
    analyticsDemoRoute
])