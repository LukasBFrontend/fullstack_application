import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from './MessageThread.module.css';
import type { Message, Author } from '../context/Types';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function MessageThread() {
  const { id } = useParams<string>();
  const { user } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Author | null>(null);
  const [messageText, setMessageText] = useState<string>('');

  async function createMessageReads(){
    try {
      const url: string = `http://localhost:3000/api/messages/${id}/read`
      await axios.post(url);
    } catch (error) {
      console.error(error);
    }
  }

  async function postMessage(){
    try {
      const url: string = `http://localhost:3000/api/messages/${id}`
      await axios.post(url, JSON.stringify({text: messageText}), {
        headers: {
          'Content-Type' : 'application/json'
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(){
    await postMessage();
    getMessages();
    setMessageText("");
  }

  useEffect(() => {
    if (!id) return console.error('Missing id parameter');
    getMessages();
    createMessageReads();
  }, []);

  async function getMessages(){
    try {
      if (!user) throw new Error('Must log in to get messages');

      const url = `http://localhost:3000/api/messages/${id}`;

      const response = await axios.get<Message[]>(url);

      if (response.data.length > 0){
        const firstMessage: Message = response.data[0];
        setOtherUser(firstMessage.sender.id == user.id ? firstMessage.recipient : firstMessage.sender);
        setMessages(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {
        user ?
        <div className={styles.body}>
          <div className={styles.header}>
            <Link to={`/inbox`} className='clickable'>Back</Link>
            <h2>{ otherUser?.username }</h2>
          </div>
          <em>This is the start of your message thread with {otherUser?.username}</em>
          <div className={styles.messages}>
          {
            messages.map((message, index) => {
              const isSender: boolean = message.sender.id == user.id;
              const showUsername = index === 0 || message.sender.id !== messages[index - 1].sender.id

              return (
                <div className={`${isSender ? styles.sender : styles.recipient}`} key={message.id}>
                  <div className={styles.message}>
                    {showUsername && <h4>{message.sender.username}</h4>}
                    <p>
                      { message.text }
                    </p>
                  </div>
                  <div className={styles.messageRead}>
                    { message.read ? `Read ✅` : `Sent ${message.created_at}`}
                  </div>
                </div>
              );
            })
          }
          </div>
          <form className={styles.messageForm} onSubmit={handleSubmit}>
            <input id='messageText' onChange={(e) => setMessageText(e.target.value)} value={messageText} className={styles.textInput} type="text" placeholder='Have something to say?' required/>
            <input id='messageSubmit' type="submit" className={`clickable ${styles.submitButton}`} value="Send"/>
          </form>
        </div> :
        <h2> Login to view messages </h2>
      }
    </>
  )
}

export default MessageThread
