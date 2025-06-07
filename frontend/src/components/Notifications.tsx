import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import type { Notification } from '../context/Types';
import type { JSX } from 'react';
import styles from './Notifications.module.css'
import axios from 'axios';

function Notifications() {
  const { user } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showOverlay, setShowOverlay] = useState<Boolean>(false);

  useEffect(() => {
    getNotifications();
  }, [user]);

  function handleClick(notificationId : string | null) {
    setShowOverlay(false);
    if (notificationId) deleteNotification(notificationId);
    getNotifications();
  }

  useEffect(() => {
    getNotifications();
  }, [showOverlay]);

  function renderNotification(notification: Notification) : JSX.Element{
    switch (notification.type) {
      case 'message':
        return <Link onClick={() => handleClick(notification.id)} to={`/profile/${notification.related_user.id}`}><b>{notification.related_user.username}</b> sent a message</Link>;
        break;
      case 'comment':
         return <Link onClick={() => handleClick(notification.id)} to={`/profile/${notification.related_user.id}`}><b>{notification.related_user.username}</b> commented on your post</Link>;
        break;
      case 'like':
         return <Link onClick={() => handleClick(notification.id)} to={`/profile/${notification.related_user.id}`}><b>{notification.related_user.username}</b> liked your post</Link>;
        break;
      case 'post':
         return <Link onClick={() => handleClick(notification.id)} to={`/profile/${notification.related_user.id}`}><b>{notification.related_user.username}</b> just made a post</Link>;
        break;
    }
  }

  async function getNotifications() {
    try {
      const url = `http://localhost:3000/api/notifications`
      const response = await axios.get<Notification[]>(url);

      setNotifications(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteNotification(id: string){
    try {
      const url = `http://localhost:3000/api/notifications/${id}`;
      await axios.delete(url);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.container}>
      {
        showOverlay &&
        <div onClick={() => setShowOverlay(false)} className={styles.overlay}>
          <ul>
            {
              notifications.length > 0 ?
              notifications.map(notification => (
                <li className={styles.notification} key={notification.id}>
                  {
                    renderNotification(notification)
                  }
                </li>
              )):
              'No notifications yet'
            }
          </ul>
        </div>
      }
      <div className={styles.icon} onClick={() => setShowOverlay(!showOverlay)}><FontAwesomeIcon icon={faGlobe}/> </div>
      <div className={styles.number}>{notifications.length > 0 && notifications.length}</div>
    </div>
  )
}

export default Notifications
