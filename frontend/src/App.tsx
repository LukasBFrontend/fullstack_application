import { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
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
import './App.css';
import axios from 'axios';

function App() {
  axios.defaults.withCredentials = true;

  const { user, setUser } = useAppContext();
  const router = createHashRouter([
    {
      children: [
        { element: <Feed />, path: '/' },
        { element: <Profile />, path: '/profile/:id' },
        { element: <Inbox />, path: '/inbox' },
        { element: <Post />, path: '/post/:id'},
        { element: <Login />, path: '/login'},
        { element: <Inbox/>, path: '/inbox'},
      ],
      element: (
        <>
          <nav id="top-nav">
            <ul>
              <li className="link">
                <Link className="clickable" to="/inbox">Contact</Link>
              </li>
              <li className="link">
                {
                   user ?
                   <Link className="clickable" to={`/profile/${user.id}`}>{user.username}</Link> :
                   <Link className="clickable" to="/login">Login</Link>
                }
              </li>
            </ul>
          </nav>
          <main>

              <Outlet />
          </main>
          <nav id="bottom-nav">
            <ul>
              <li className="link">
                <Link className="clickable" to="/">Home</Link>
              </li>
              <li className="link">
                <Link className="clickable" to="/inbox">Messages</Link>
              </li>
              <li className="link">
                <Link className="clickable" to="/post/2">Post</Link>
              </li>
            </ul>
          </nav>
        </>
      )
    }
  ])

  return <RouterProvider router={router}/>
}

export default App
