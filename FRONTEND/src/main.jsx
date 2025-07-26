import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/performance.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routing/routeTree.js'
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Provider } from 'react-redux'
import { store } from './store/store.js'

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    store
  }
})

// Performance optimization: Enable concurrent features
const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)
