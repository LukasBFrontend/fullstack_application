import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import type { User, Post, Friendship } from '../context/Types';
import Posts from '../components/Posts';
import styles from './Profile.module.css';
import Friends from '../components/Friends';
import axios from 'axios'

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [showFriends, setShowFriends] = useState<Boolean>(false);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  let loggedInUser = useAppContext().user;
  const { friends, setFriends } = useAppContext();
  const { setPosts } = useAppContext();
  const { id } = useParams<{ id: string }>();

  async function getUser() {
    const url: string = `http://localhost:3000/api/users/${id}`;
    try {
      const response = await axios.get<User>(url);
      setUser(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  async function getUserFriends(){
    const url: string = `http://localhost:3000/api/users/${id}/friends`;

    try {
      const response = await axios.get<User[]>(url);
      setFriends(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  async function getUserFriendship(){
    if (loggedInUser?.id == id) return;

    const url: string = `http://localhost:3000/api/users/${id}/friendship`;

    try {
      const response = await axios.get<Friendship>(url);
      setFriendship(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  async function sendFriendrequest(){
    const url: string = `http://localhost:3000/api/users/${id}/friendship`;

    try {
      await axios.post(url);
      await getUserFriendship();
    } catch (error) {
      return console.error(error);
    }
  }

  async function deleteFriendship(){
    const url: string = `http://localhost:3000/api/users/${id}/friendship`;

    try {
      await axios.delete(url);
      setFriendship(null);
      await getUserFriends();
    } catch (error) {
      return console.error(error);
    }
  }

  async function updateFriendship(status: string){
    const url: string = `http://localhost:3000/api/users/${id}/friendship`;

    try {
      await axios.patch(url, JSON.stringify({status}), {
        headers : {
          "Content-Type" : "application/json"
        }
      });

      await getUserFriends();
      await getUserFriendship();
    } catch (error) {
      return console.error(error);
    }
  }

  async function getUserPosts() {
    const url: string = `http://localhost:3000/api/posts?author_id=${id}`;

    try {
      const response = await axios.get<Post[]>(url);
      setPosts(response.data);
    } catch (error) {
      return console.error(error);
    }
  }

  async function cacheUser(){
    if (!id) return console.error('Missing id parameter');
    getUser();
    getUserPosts();
    getUserFriends();
    getUserFriendship();
  }

  function mapFriendship(){
    if (!friendship) return <button onClick={() => sendFriendrequest()}>Add friend</button>

    let content;

    switch (friendship.status){
      case 'accepted':
        content = <button onClick={() => deleteFriendship()}>Remove friend</button>;
        break;
      case 'pending':
        content = loggedInUser?.id == friendship.user_id ?
        'Friend request sent...':
        <>
          Friendrequest
          <button onClick={() => updateFriendship('accepted')}>Accept</button>
          <button onClick={() => updateFriendship('rejected')}>Decline</button>
        </>;
        break;
      case 'rejected':
        deleteFriendship();
        break;
      default:
        console.error('Error while mapping friendship');
    }

    return content;
  }

  useEffect(() => {
    if (loggedInUser) cacheUser();
  }, [loggedInUser, id]);

  return (
    <div className={`body`}>
      <div className={styles.user}>
        <h2>{user ? user.username : 'Username'}</h2>
        <div className='clickable' onClick={() => setShowFriends(true)}>Friends: {friends?.length}</div>
        <p>{user?.biography ? user.biography : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima at quasi in fugit inventore dolorem cupiditate modi, aperiam quas voluptas?'}</p>
      </div>
      {
      showFriends &&
      <div className={styles.overlay} onClick={() => setShowFriends(false)}>
        <button onClick={() => setShowFriends(false)}>Back</button>
        <Friends></Friends>
      </div>
      }
      <div className={styles.friendshipStatus}>{loggedInUser?.id != id && mapFriendship()}</div>
      <Posts></Posts>
    </div>

  )
}

export default Profile
