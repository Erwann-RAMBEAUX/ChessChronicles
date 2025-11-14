import React from 'react'
import { createRoot } from 'react-dom/client'
import HomePage from './routes/HomePage'
import ProfilePage from './routes/ProfilePage'
import LegendaryPage from './routes/LegendaryPage'
import NotFoundPage from './routes/NotFoundPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import GamePage from './routes/GamePage'
import './index.css'
import './i18n'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/player', element: <ProfilePage /> },
  { path: '/player/:username', element: <ProfilePage /> },
  { path: '/legendary', element: <LegendaryPage /> },
  { path: '/game', element: <GamePage /> },
  { path: '/live/game/:id', element: <GamePage /> },
  { path: '/daily/game/:id', element: <GamePage /> },
  { path: '*', element: <NotFoundPage /> },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
