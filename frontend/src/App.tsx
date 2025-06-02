import { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Feed from './pages/Feed';
import Inbox from './pages/Inbox';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Login from './pages/Login';
import MessageThread from './pages/MessageThread';
import Notifications from './components/Notifications';
import CreatePost from './pages/CreatePost';
import {
  createHashRouter,
  Link,
  Outlet,
  RouterProvider
} from 'react-router-dom'
import './App.css';
import axios from 'axios';

function Layout() {
  const { user } = useAppContext();

  return (
    <>
      <nav id="top-nav">
        <ul>
          <li className="link">
            <Link className="clickable" to={user ? `/profile/${user.id}` : '/login'}>
              {user ? user.username : 'Login'}
            </Link>
          </li>
          <li className="link">
            <Notifications />
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
            <Link className="clickable" to="/createPost"><b>+</b></Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

function App() {
  axios.defaults.withCredentials = true;

  const { setUser } = useAppContext();

  useEffect(() => {
    const loggedInUser: string | null = window.sessionStorage.getItem("user");
    setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
  }, []);

  const router = createHashRouter([
    {
      children: [
        { element: <Feed />, path: '/' },
        { element: <Profile />, path: '/profile/:id' },
        { element: <Inbox />, path: '/inbox' },
        { element: <Post />, path: '/post/:id'},
        { element: <Login />, path: '/login'},
        { element: <Inbox/>, path: '/inbox'},
        { element: <MessageThread />, path: '/messages/:id'},
        { element: <CreatePost />, path: '/createPost'}
      ],
      element: <Layout/>
    }
  ])

  return <RouterProvider router={router}/>
}

export default App
