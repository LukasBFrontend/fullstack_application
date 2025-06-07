import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import styles from './Friends.module.css';

function Friends() {
  const { friends } = useAppContext();

  return (
    <ul className={styles.friendList}>
      {friends?.map(friend => (
        <li className={`clickable ${styles.friend}`} key={friend.id}>
          <div className={styles.pfp}>{friend.username[0]}</div>
          <Link to={`/profile/${friend.id}`}>{friend.username}</Link>
        </li>
      ))}
    </ul>
  )
}

export default Friends
