import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import styles from './Posts.module.css'

function Posts() {
  const { posts } = useAppContext();

  return (
    <div className={styles.posts}>
      {
        posts?.map(post => (
            <Link to={`/post/${post.id}`} className={styles.post} key={post.id}>
              <div className={styles.header}>
                <h3>{post.title_text}</h3>
                <div className={styles.icons}>
                  <span>{post.likes} <FontAwesomeIcon style={{color: 'rgb(202, 59, 59)'}} icon={faHeart}/> </span>
                  <span>{post.comments.length} <FontAwesomeIcon icon={faComment}/></span>
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
