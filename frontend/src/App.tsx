import { /*useState,*/ useEffect } from 'react'
import './App.css'

function App() {
  //const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api');
      const data: { hello: string} = await response.json();


      alert('Hello ' + data.hello + '!');
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
