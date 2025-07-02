import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './../routing/routeTree.js'
import AuthPage from './../pages/AuthPage.jsx'

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage
})