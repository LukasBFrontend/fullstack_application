import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CreatePost.module.css';

function CreatePost() {
  const { user } = useAppContext();
  const [title, setTitle] = useState<String>("");
  const [text, setText] = useState<String>("");
  const [postId, setPostId] = useState<String | null>(null);
  const maxTitleLength = 50;
  const maxBodyLength = 300;

  const navigate = useNavigate();

  useEffect(() => {
    if (postId) navigate(`/post/${postId}`);
  }, [postId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (user) createPost();
  };

  async function createPost(){
    try {
      const url = `http://localhost:3000/api/posts/create`;
      const response = await axios.post(url, JSON.stringify({
        title,
        text
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setPostId(response.data.postId);

      console.log(response);
      alert("Post created!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='body'>
      <h2>
        Create post
      </h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <label htmlFor='titleText'>Topic</label>
          <input id='titleText' onChange={e => setTitle(e.target.value)} type="text" maxLength={maxTitleLength} placeholder='A quick summary of your post...'required/>
          <span className={styles.characterCounter}>{title.length} / {maxTitleLength}</span>
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor='bodyText'>Text</label>
          <div id='bodyText' className={styles.textareaWrapper}>
            <div
    className={styles.textarea}
    contentEditable
    onInput={(e) => setText(e.currentTarget.textContent || "")}
    data-placeholder="Write about your topic here..."
    suppressContentEditableWarning
  />
          </div>
          <span className={styles.characterCounter}>{text.length} / {maxBodyLength}</span>
        </div>
        <button className={`clickable`} type="submit">Create</button>
      </form>
    </div>
  )
}

export default CreatePost
