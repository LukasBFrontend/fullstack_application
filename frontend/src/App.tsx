import { /*useState,*/ useEffect } from 'react'
import './App.css'

function App() {
  //const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api');
      const data: { message: string} = await response.json();


      alert(data.message);
    }

    fetchData();
  }, [])
  return (
    <>
      <h1>aaaa</h1>
    </>
  )
}

export default App
