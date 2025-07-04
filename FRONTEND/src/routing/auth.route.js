import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './../routing/routeTree.js'
import AuthPage from './../pages/AuthPage.jsx'
import RegisterPage from './../pages/RegisterPage.jsx'

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