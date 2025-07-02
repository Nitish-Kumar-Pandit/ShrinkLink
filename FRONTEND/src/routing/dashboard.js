import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './../routing/routeTree.js'
import DashboardPage from './../pages/DashboardPage.jsx'

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage
})