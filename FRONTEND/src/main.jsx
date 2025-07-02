import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routing/routeTree.js'
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Provider } from 'react-redux'
import { store } from './store/store.js'

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </Provider>
)
