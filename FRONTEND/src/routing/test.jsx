import { createRoute } from '@tanstack/react-router'

// This will be set by the routeTree.js file
let parentRoute = null;

export const setParentRoute = (route) => {
  parentRoute = route;
};

// Simple test component
const TestComponent = () => {
  console.log('🎯 Test route is working!')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-800">Test Route Works!</h1>
        <p className="text-green-600 mt-2">This confirms routing is functional</p>
      </div>
    </div>
  )
}

export const testRoute = createRoute({
  getParentRoute: () => parentRoute,
  path: '/test-route',
  component: TestComponent
})
