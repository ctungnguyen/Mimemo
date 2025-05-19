import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import bgMusic from './audio/ambient.mp3';
import './index.css';

import NotFound from './pages/NotFound.jsx';
import HomePage from './pages/HomePage.jsx';
import Notebook from './pages/Notebook.jsx';
import Wall from './pages/Wall.jsx';
import WallEdit from './pages/WallEdit.jsx';
import Photobooth from './pages/Photobooth.jsx';
import PreviewPhoto from './pages/PreviewPhoto.jsx';
import AudioPlayer from './components/AudioPlayer.jsx';
import ClickSoundPlayer from './components/ClickSoundPlayer.jsx'; // <-- import this


const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
      errorElement: <NotFound />,
    },
    {
      path: '/:userId',
      element: <HomePage />,
      errorElement: <NotFound />,
    },
    {
      path: '/:userId/photobooth',
      element: <Photobooth />,
      errorElement: <NotFound />,
    },
    {
      path: '/:userId/photobooth/preview_photo',
      element: <PreviewPhoto />,
      errorElement: <NotFound />,
    },
    {
      path: '/:userId/wall',
      element: <Wall />,
      errorElement: <NotFound />,
    },
    {
      path: '/:userId/wall/edit',
      element: <WallEdit />,
      errorElement: <NotFound />,
    },
    {
      path: '/:userId/notebook/:notebookId',
      element: <Notebook />,
      errorElement: <NotFound />,
    },
  ],
  {
    //  This is what tells React Router to use GitHub Pages base path
    basename: '/Mimemo',
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AudioPlayer src={bgMusic} loop  />
    <ClickSoundPlayer />
    <RouterProvider router={router} />
  </React.StrictMode>
);
