import {useEffect, useState } from 'react'
import axios from 'axios'
import styles from './Post.module.css'
import { useAppContext } from '../context/AppContext'
import type { Post } from '../context/Types'
import { Link, useParams } from 'react-router-dom'

function Post() {
  const { posts, setPosts } = useAppContext();
  const [post, setPost] = useState<Post | null>(posts? posts[0] : null);
  const { id } = useParams<{ id: string }>();

  function handleSubmit(){

  }

  useEffect(() => {
    id ? getPost(id) : console.log('No id parameter');
  }, [])

  async function getPost(id: string) {
    try {
      const response = await axios.get<Post>(`http://localhost:3000/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  return (
    <div className={styles.body}>
        <div className={styles.topWrapper}>
          <Link className="clickable" to="/">⬅️ Back</Link>
          <div className={styles.postInfo}>
            <p>
              {post ? post.author.username : 'Author'}
            </p>
            <p>
              {post ? post.created_at.substring(0, 10) : 'creation date'}
            </p>
          </div>
        </div>
        <div className={styles.postContent}>
          <h2>
            {post ? post.title_text : 'Title'}
          </h2>
          <p>
            {post ? post.body_text : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea distinctio doloremque cumque quasi amet temporibus facilis veritatis libero earum illo?'}
          </p>
        </div>

      <div className={styles.commentSection}>
        <h3>Comments</h3>
        <ul className={styles.commentsWrapper}>
          {
            post ? post.comments.map(comment => (
              <li className={styles.comments} key={comment.comment_id}>
                <div className={styles.commenterInfo}>
                  <h4>{comment.user.name}</h4>
                  <p>{comment.created_at}</p>
                </div>
                <p>{comment.text}</p>
              </li>
            ))
            : <p>No comments yet</p>
          }
        </ul>
      </div>

      <form className={styles.commentForm} onSubmit={handleSubmit}>
          <input className={styles.textInput} type="text" placeholder='Have something to say?'/>
          <input type="submit" className='clickable' value="Send"/>
      </form>
    </div>
  )
}

export default Post
