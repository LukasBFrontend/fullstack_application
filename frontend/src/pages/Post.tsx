import {useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Link, useParams } from 'react-router-dom'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons/faHeart';
import { faHeart, faArrowTurnUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Post as post } from '../context/Types'
import styles from './Post.module.css'
import axios from 'axios'

function Post() {
  const { posts, user } = useAppContext();
  const [commentText, setCommentText] = useState<string>('');
  const [post, setPost] = useState<post | null>(posts? posts[0] : null);
  const { id } = useParams<{ id: string }>();

  function handleSubmit(){
    postComment();
    setCommentText('');
    getPost();
  }

  function handleLike(){
    if (!user) return alert('Log in to like posts!');

    if (!post?.liked_by_user) likePost();
    else unlikePost();

    getPost();
  }

  async function likePost(){
    try {
      const url: string = `http://localhost:3000/api/posts/${id}/like`;
      await axios.post(url);

    } catch (error) {
      console.error(error);
    }
  }

  async function unlikePost(){
    try {
      const url: string = `http://localhost:3000/api/posts/${id}/like`;
      await axios.delete(url);

    } catch (error) {
      console.error(error);
    }
  }

  async function postComment(){
    try {
      const url: string = `http://localhost:3000/api/posts/${id}/comment`;
      await axios.post(url, JSON.stringify({text: commentText}), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    id ? getPost() : console.error('No id parameter');
  }, [])

  async function getPost() {
    try {
      const response = await axios.get<post>(`http://localhost:3000/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.body}>
          <div className={styles.headerWrapper}>
            <div className={styles.header}>
              <Link className={`clickable backButton`} to="/"><FontAwesomeIcon icon={faArrowTurnUp}/></Link>
              <Link to={`/profile/${post?.author.id}`} className={`clickable`}>
              {post ? post.author.username : 'Author'}
              </Link>
            </div>
          </div>
          <p className={styles.postDate}>
            {post ? post.created_at.substring(0, 10) : 'creation date'}
          </p>
          <div className={styles.postContent}>
            <h2>
              {post ? post.title_text : 'Title'}
            </h2>
            <p>
              {post ? post.body_text : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea distinctio doloremque cumque quasi amet temporibus facilis veritatis libero earum illo?'}
            </p>
            <div className={styles.likes} onClick={() => handleLike()}>
              <span>{post?.likes} </span>
              <FontAwesomeIcon icon={!post?.liked_by_user ? faHeartRegular : faHeart } />
            </div>
          </div>

        <div className={styles.commentSection}>
          <h3>Comments {post?.comments.length}</h3>
          <ul className={styles.commentsWrapper}>
            {
              post ? post.comments.map(comment => (
                <li className={styles.comments} key={comment.comment_id}>
                  <div className={styles.commenterInfo}>
                    <Link to={`/profile/${comment.user.id}`}>
                      <h4>{comment.user.name}</h4>
                    </Link>
                    <p>{comment.created_at}</p>
                  </div>
                  <p>{comment.text}</p>
                </li>
              ))
              : <p>No comments yet</p>
            }
          </ul>
        </div>
        <div className={styles.formWrapper}>
          <form className={styles.commentForm} onSubmit={handleSubmit}>
              <input id='commentText' onChange={(e) => setCommentText(e.target.value)} value={commentText} className={styles.textInput} type="text" placeholder='Have something to say?' required/>
              <input id='commentSubmit' type='submit' className={`clickable ${styles.submitButton}`} value="Send"/>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Post
