import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './../routing/routeTree.js'
import HomePage from '../pages/HomePage.jsx'

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage
})