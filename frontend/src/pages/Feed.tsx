import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'

function Feed() {
  const { user }= useAppContext()
  return (
    <div>
      <h2>{user ?? 'Guest'}</h2>
      <div className="link">
        <Link to="/post">Post</Link>
      </div>
    </div>
  )
}

export default Feed
