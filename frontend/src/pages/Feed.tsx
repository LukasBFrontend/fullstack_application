//import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Feed.module.css'
import type { Post } from '../context/Types';
import Posts from '../components/posts';
import { useAppContext } from '../context/AppContext'

function Feed() {
  //const { user }= useAppContext()

  /* const [posts, setPosts] = useState<Post[]>([]); */
  const {posts, setPosts}= useAppContext();

  useEffect(() => {
    getPosts();
  }, []);

  async function getPosts() {
    const url: string = "http://localhost:3000/api";

    try {
      const response = await axios.get<Post[]>(`${url}/posts`);
      setPosts(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  return (
    <div className={styles.body}>
      <h2>Posts</h2>
      <Posts></Posts>
    </div>
  )
}

export default Feed
