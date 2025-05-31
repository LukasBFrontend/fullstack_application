import { useState, useEffect} from 'react'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom';
import type { User, Author, Message } from '../context/Types'
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
    console.log('Mapping threads');
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
    <div>
    {/* {
      messages ?
      messages.map(message => (
        <div>
          <h3>
            sender: {message.sender.username}
          </h3>
          <h3>
            recipient: {message.recipient.username}
          </h3>
          <p>
            {message.text}
          </p>
        </div>
      )):
      <p>
        nothing
      </p>
    } */}
    {
      threads.map(thread => (
        <div key={thread.otherUser.id}>
          <div>
            <h3>
              {thread.otherUser.username}
            </h3>
            <p>{thread.latestMessage.created_at}</p>
          </div>
          <p>
            {thread.latestMessage.text}
          </p>
        </div>
      ))
    }
    </div>
  )
}

export default Inbox
