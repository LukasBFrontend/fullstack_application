import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext'
import type { Post } from '../context/Types';
import Posts from '../components/Posts';
import axios from 'axios';

function Feed() {
  const { setPosts }= useAppContext();

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
    <div className={`body`}>
      <h2>Posts</h2>
      <Posts></Posts>
    </div>
  )
}

export default Feed
