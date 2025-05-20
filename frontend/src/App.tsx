import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext';
import Feed from './pages/Feed';
import Inbox from './pages/Inbox';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Login from './pages/Login';
import {
  createHashRouter,
  Link,
  Outlet,
  RouterProvider
} from 'react-router-dom'
import './App.css'

function App() {
  const router = createHashRouter([
    {
      children: [
        { element: <Feed />, path: '/' },
        { element: <Profile />, path: '/profile' },
        { element: <Inbox />, path: '/inbox' },
        { element: <Post />, path: '/post'},
        { element: <Login />, path: '/login'}
      ],
      element: (
        <>
          <nav>
            <ul>
              <li className="link">
                <Link to="/">Feed</Link>
              </li>
              <li className="link">
                <Link to="/profile">Profile</Link>
              </li>
              <li className="link">
                <Link to="/inbox">Contact</Link>
              </li>
              <li className="link">
                <Link to="/post">Post</Link>
              </li>
              <li className="link">
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </nav>
          <main>
            <AppProvider>
              <Outlet />
            </AppProvider>
          </main>
        </>
      )
    }
  ])

  return <RouterProvider router={router}/>
}

export default App
