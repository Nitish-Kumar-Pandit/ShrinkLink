import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './routeTree.js'
import AnalyticsDemoPage from '../pages/AnalyticsDemoPage.jsx'

export const analyticsDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics-demo',
  component: AnalyticsDemoPage
})
