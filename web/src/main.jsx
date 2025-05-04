import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
//import { Provider } from 'react-redux';

//import {store} from './redux/store'

import NotFound from './pages/NotFound.jsx'
import HomePage from './pages/HomePage.jsx'
import Notebook from './pages/Notebook.jsx';
import Wall from './pages/Wall.jsx';
import WallEdit from './pages/WallEdit.jsx';
import Photobooth from './pages/Photobooth.jsx';
import PreviewPhoto from './pages/PreviewPhoto.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage/>,
    errorElement: <NotFound />,
  },

  {
    path: "/photobooth",
    element: <Photobooth/>,
    errorElement: <NotFound />,
  },

  {
    path: "/photobooth/preview_photo",
    element: <PreviewPhoto/>,
    errorElement: <NotFound />,
  },

  // {
  //   path: "/wall",
  //   element: <Wall/>,
  //   errorElement: <NotFound />,
  //   children: [
  //         {
  //           path: "edit",
  //           element: <WallEdit/>,
  //           errorElement: <NotFound />,
  //         },
  //       ]
  // },

  {
    path: "/wall",
    element: <Wall/>,
    errorElement: <NotFound />,
  },

  {
    path: "/wall/edit",
    element: <WallEdit/>,
    errorElement: <NotFound />,
  },

  {
    path: "/notebook",
    element: <Notebook/>,
    errorElement: <NotFound />,
  },

  // {
  //   path:"/login",
  //   element: <BasicInfo/>,
  //   errorElement: <NotFound/>
  // },

  // {
  //   path:"/register",
  //   element: <BasicInfo/>,
  //   errorElement: <NotFound/>
  // },

  // {
  //   path: "/edit/:postId",
  //   element:<UpdatePost/>,
  //   errorElement: <NotFound/>
  // },
  // {
  //   path: "/history/:postId",
  //   element: <EditHistory/>,
  //   errorElement: <NotFound/>
  // },

  // {
  //   path: "/:username",
  //   element: <Profile/>,
  //   errorElement: <NotFound />,
  //   children: [
  //     {
  //       path: "posts",
  //       element: <ProfilePosts/>,
  //       errorElement: <NotFound />,
  //     },
  //     {
  //       path: "about",
  //       element: <ProfileAbout/>,
  //       errorElement: <NotFound />,
  //     },     
  //     {
  //       path: "friends",
  //       element: <ProfileFriends/>,
  //       errorElement: <NotFound />,
  //     },
  //     {
  //       path: "photos",
  //       element: <ProfilePhotos/>,
  //       errorElement: <NotFound />,
  //     },
  //     {
  //       path: "edit",
  //       element: <EditProfile/>,
  //       errorElement: <NotFound/>,
  //     },
  //   ]
  // }, 

  // {
  //   path: "/:username/edit/change_pass",
  //   element: <ChangePassword/>,
  //   errorElement: <NotFound />,
  // },

  // {
  //   path: "/admin",
  //   element: <Admin/>,
  //   errorElement: <NotFound />,
  //   children: [
  //     {
  //       path: "suspend",
  //       element: <AdminSuspend/>,
  //       errorElement: <NotFound />,
  //     },
  //     {
  //       path: "approve",
  //       element: <AdminApprove/>,
  //       errorElement: <NotFound />,
  //     },
  //     {
  //       path: "resume",
  //       element: <AdminResume/>,
  //       errorElement: <NotFound />,
  //     }
  //   ]
  // },
]);


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);