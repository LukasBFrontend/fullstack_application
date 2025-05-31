import axios from 'axios'
import { useEffect, useState } from 'react';
import type { User, Post } from '../context/Types';
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import Posts from '../components/posts';
import styles from './Profile.module.css';

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const { posts, setPosts } = useAppContext();
  const { id } = useParams<{ id: string }>();

  async function getUser(id: string) {
    const url: string = `http://localhost:3000/api/users/${id}`;
    try {
      const response = await axios.get<User>(url);
      setUser(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  async function getUserPosts(id: string) {
    const url: string = `http://localhost:3000/api/posts?author_id=${id}`;

    try {
      const response = await axios.get<Post[]>(url);
      setPosts(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  useEffect(() => {
    if (id) getUser(id);
    if (id) getUserPosts(id);
  }, []);

  return (
    <div className={styles.body}>
      <div className={styles.user}>
        <h2>{user ? user.username : 'Username'}</h2>
        <p>{user?.biography ? user.biography : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima at quasi in fugit inventore dolorem cupiditate modi, aperiam quas voluptas?'}</p>
      </div>
      <Posts></Posts>
    </div>

  )
}

export default Profile
