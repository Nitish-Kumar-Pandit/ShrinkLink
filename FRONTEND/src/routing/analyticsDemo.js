import { createRoute } from '@tanstack/react-router'
import AnalyticsDemoPage from '../pages/AnalyticsDemoPage.jsx'

// This will be set by the routeTree.js file
let parentRoute = null;

export const setParentRoute = (route) => {
  parentRoute = route;
};

export const analyticsDemoRoute = createRoute({
  getParentRoute: () => parentRoute,
  path: '/analytics-demo',
  component: AnalyticsDemoPage
})
