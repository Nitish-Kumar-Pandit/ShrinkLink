import { createRoute } from '@tanstack/react-router'
import HomePage from '../pages/HomePage.jsx'

// This will be set by the routeTree.js file
let parentRoute = null;

export const setParentRoute = (route) => {
  parentRoute = route;
};

export const homeRoute = createRoute({
  getParentRoute: () => parentRoute,
  path: '/',
  component: HomePage
})