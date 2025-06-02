import { useAppContext } from '../context/AppContext'
import { useState, useEffect } from 'react';
import styles from './Login.module.css'
import axios from 'axios';
import type { User } from '../context/Types'
import { useNavigate } from 'react-router-dom';

function Login() {
  const { user, setUser } = useAppContext();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if(user) {
      window.sessionStorage.setItem("user", JSON.stringify(user));
      navigate('/');
    }
  }, [user]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    loginPost();
  }

  async function loginPost()
  {
    try {
      const response = await axios.post('http://localhost:3000/api/users/login', JSON.stringify({
        email,
        password
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
      setUser(response.data.user);

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.body}>
      <p>User: {user? user.username : 'Guest'}</p>
      <h2>Login</h2>
      <div className={styles.inputsWrapper}>
        <div className={styles.inputWrapper}>
          <label htmlFor="email">Email</label>
          <input id="email" onChange={e => {setEmail(e.target.value)}} placeholder='Email'></input>
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="password">Password</label>
          <input id="password" onChange={e => {setPassword(e.target.value)}} placeholder='Password'></input>
        </div>
      </div>
      <button className='clickable' type="submit">Login</button>
    </form>
  )
}

export default Login
