import React from 'react'
import styles from './Posts.module.css'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'

function Posts() {
  const { posts, setPosts } = useAppContext();

  return (
    <div className={styles.posts}>
      {
        posts?.map(post => (
            <Link to={`/post/${post.id}`} className={styles.post} key={post.id}>
              <div className={styles.header}>
                <h3>{post.title_text}</h3>
                <div className={styles.icons}>
                  <span>{post.likes} ❤️</span>
                  <span>{post.comments.length} 🗨️</span>
                </div>
              </div>
              <p className={styles.date}>{post.created_at}</p>
            </Link>
        ))
      }
    </div>
  )
}

export default Posts
