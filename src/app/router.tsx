import { createBrowserRouter } from 'react-router'

import { HomePage } from '@/pages/HomePage'
import { QueuePage } from '@/pages/QueuePage'

import { AppLayout } from './layouts/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'queue', element: <QueuePage /> },
    ],
  },
])
