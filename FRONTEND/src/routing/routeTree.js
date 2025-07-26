import { createRootRoute, createRoute } from '@tanstack/react-router'
import RootLayout from './../RouteLayout.jsx';
import HomePage from '../pages/HomePage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import AnalyticsDemoPage from '../pages/AnalyticsDemoPage.jsx'
import { getCurrentUser } from '../api/user.api.js'
import { setUser } from '../store/slices/authSlice.js'
import { redirect } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: RootLayout
})

// Define routes directly without circular dependencies
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
})

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage
})

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage
})

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
  beforeLoad: async ({ context }) => {
    try {
      const { store } = context;

      // Check if user is already in store
      const state = store.getState();
      if (state.auth.user) {
        return;
      }

      // Try to get current user
      const response = await getCurrentUser();
      if (response.user) {
        store.dispatch(setUser(response.user));
      } else {
        throw redirect({
          to: '/auth',
          search: {
            redirect: '/dashboard'
          }
        });
      }
    } catch (error) {
      console.error('Dashboard auth check failed:', error);
      throw redirect({
        to: '/auth',
        search: {
          redirect: '/dashboard'
        }
      });
    }
  }
})

export const analyticsDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics-demo',
  component: AnalyticsDemoPage
})

export const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    registerRoute,
    dashboardRoute,
    analyticsDemoRoute
])