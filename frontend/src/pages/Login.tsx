import { useAppContext } from '../context/AppContext'

function Login() {
  const { user, setUser } = useAppContext();
  return (
    <div>
      <p>User: {user ?? 'Guest'}</p>
      <button onClick={() => setUser('Lukas')}>Login</button>
    </div>
  )
}

export default Login
