import { useState, useEffect} from 'react'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom';
import type { User, Author, Message } from '../context/Types'
import styles from './/Inbox.module.css'
import axios from 'axios';

function Inbox() {
const { user } = useAppContext();
const [messages, setMessages] = useState<Message[]>([]);
const [threads, setThreads] = useState<Thread[]>([])

interface Thread {
  otherUser: Author;
  latestMessage: Message;
}

async function getMessages(){
  try {
    const url: string = `http://localhost:3000/api/messages`
    const response = await axios.get<Message[]>(url);
    setMessages(response.data);
  } catch (error) {
    console.error(error);
  }
};

function mapThreads() {
  if (user)
  {
    for (let i = 0; i < messages.length; i++) {
      const otherUser: Author = messages[i].recipient.id == user.id ? messages[i].sender : messages[i].recipient;
      if (threads.find(thread => (
        thread.otherUser.id == otherUser.id
      ))) {
        continue;
      }
      setThreads([...threads, {otherUser: otherUser, latestMessage: messages[i]}]);
    }
  }
};

useEffect(() => {
  getMessages();
}, []);

useEffect(() => {
  if (messages.length > 0) {
    mapThreads();
  }
}, [messages]);
  return (
    <div className='body'>
    {
      threads.map(thread => (
        <div className={styles.messageThread} key={thread.otherUser.id}>
          <Link to={`/profile/${thread.otherUser.id}`} className={styles.messageHeader}>
            <span className={styles.username}>
              {thread.otherUser.username}
            </span>
            <span><i>{thread.latestMessage.created_at}</i></span>
          </Link>
          <Link to={`/messages/${thread.otherUser.id}`}>
            <p className={styles.message}>{thread.latestMessage.text}</p>
          </Link>
        </div>
      ))
    }
    </div>
  )
}

export default Inbox
