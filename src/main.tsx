import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './routes/HomePage';
import ProfilePage from './routes/ProfilePage';
import LegendaryPage from './routes/LegendaryPage';
import NotFoundPage from './routes/NotFoundPage';
import LanguageProvider from './routes/LanguageProvider';
import i18n from './i18n';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import GamePage from './routes/GamePage';
import AnalyzePage from './routes/AnalyzePage';
import AboutPage from './routes/AboutPage';
import './index.css';


const router = createBrowserRouter([
  { path: '/', element: <Navigate to={`/${i18n.language || 'en'}`} replace /> },
  {
    path: '/:lng',
    element: <LanguageProvider />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'player', element: <ProfilePage /> },
      { path: 'player/:username', element: <ProfilePage /> },
      { path: 'legendary', element: <LegendaryPage /> },
      { path: 'game', element: <GamePage /> },
      { path: 'analyze', element: <AnalyzePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
);
