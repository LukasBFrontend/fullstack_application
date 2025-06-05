import {useEffect, useState } from 'react'
import axios from 'axios'
import styles from './Post.module.css'
import { useAppContext } from '../context/AppContext'
import type { Post } from '../context/Types'
import { Link, useParams } from 'react-router-dom'
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons/faHeart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Post() {
  const { posts, setPosts, user } = useAppContext();
  const [commentText, setCommentText] = useState<string>('');
  const [post, setPost] = useState<Post | null>(posts? posts[0] : null);
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
      const response = await axios.get<Post>(`http://localhost:3000/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  return (
    <div className={styles.body}>
        <div className={styles.topWrapper}>
          <Link className="clickable" to="/">⬅ Back</Link>
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
          <div onClick={() => handleLike()}>
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
          <input id='commentText' onChange={(e) => setCommentText(e.target.value)} value={commentText} className={styles.textInput} type="text" placeholder='Have something to say?' required/>
          <input id='commentSubmit' type='submit' className={`clickable ${styles.submitButton}`} value="Send"/>
      </form>
    </div>
  )
}

export default Post
