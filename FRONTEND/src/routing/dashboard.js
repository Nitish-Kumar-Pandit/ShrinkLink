import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './../routing/routeTree.js'
import DashboardPage from './../pages/DashboardPage.jsx'
import { getCurrentUser } from '../api/user.api.js'
import { setUser } from '../store/slices/authSlice.js'
import { redirect } from '@tanstack/react-router'

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
  beforeLoad: async ({ context }) => {
    try {
      const { store } = context;

      // Check if user is already authenticated in Redux store
      const { isAuthenticated } = store.getState().auth;
      if (isAuthenticated) {
        return;
      }

      // If not authenticated in store, try to get user from API
      const response = await getCurrentUser();
      if (response && response.user) {
        store.dispatch(setUser(response.user));
        return;
      }

      // If no user found, redirect to auth
      throw redirect({ to: '/auth' });
    } catch (error) {
      // If any error occurs, redirect to auth
      throw redirect({ to: '/auth' });
    }
  }
})