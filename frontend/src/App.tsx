import { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faComment } from '@fortawesome/free-solid-svg-icons';
import {
  createHashRouter,
  Link,
  Outlet,
  RouterProvider
} from 'react-router-dom'
import Feed from './pages/Feed';
import Inbox from './pages/Inbox';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Login from './pages/Login';
import MessageThread from './pages/MessageThread';
import Notifications from './components/Notifications';
import CreatePost from './pages/CreatePost';
import './App.css';
import axios from 'axios';

function Layout() {
  const { user } = useAppContext();

  return (
    <div id="wrapper">
      <nav id="top-nav">
        <ul className='navList'>
          <li className="link">
            <Link className="clickable" to={user ? `/profile/${user.id}` : '/login'}>
              {user ? user.username : 'Login'}
            </Link>
          </li>
          <li className="link notifications">
            <Notifications />
          </li>
        </ul>
      </nav>
      <nav id="bottom-nav">
        <ul className='navList'>
          <li className="link">
            <Link className="clickable home" to="/"><FontAwesomeIcon icon={faHouse}/></Link>
          </li>
          <li className="link secondItem">
            <Link className="clickable createPost" to="/createPost"><b>+</b></Link>
          </li>
          <li className="link">
            <Link className="clickable inbox" to="/inbox"><FontAwesomeIcon className="mirrorX" icon={faComment}/></Link>
          </li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
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
