import { createRootRoute } from '@tanstack/react-router'
import RootLayout from './../RouteLayout.jsx';
import { homeRoute, setParentRoute as setHomeParentRoute } from './homePage.js';
import { authRoute, registerRoute, setParentRoute as setAuthParentRoute } from './auth.route.js';
import { dashboardRoute, setParentRoute as setDashboardParentRoute } from './dashboard.js';
import { analyticsDemoRoute, setParentRoute as setAnalyticsParentRoute } from './analyticsDemo.js';
import { redirectRoute, setParentRoute as setRedirectParentRoute } from './redirect.jsx';
import { testRoute, setParentRoute as setTestParentRoute } from './test.jsx';
import { catchAllRoute, setParentRoute as setCatchAllParentRoute } from './catchAll.jsx';

export const rootRoute = createRootRoute({
  component: RootLayout
})

// Set the parent route for all routes
setHomeParentRoute(rootRoute);
setAuthParentRoute(rootRoute);
setDashboardParentRoute(rootRoute);
setAnalyticsParentRoute(rootRoute);
setRedirectParentRoute(rootRoute);
setTestParentRoute(rootRoute);
setCatchAllParentRoute(rootRoute);

export const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    registerRoute,
    dashboardRoute,
    analyticsDemoRoute,
    redirectRoute,
    testRoute,
    catchAllRoute
])