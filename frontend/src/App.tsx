import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [titleText, setTitleText] = useState<string>();
  const [bodyText, setBodyText] = useState<string>();
  const [author, setAuthor] = useState<string>();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/1');
      const data: { title_text: string, body_text: string, author: {username : string}} = await response.json();

      setAuthor(data.author.username)
      setBodyText(data.body_text);
      setTitleText(data.title_text);
    }

    fetchData();
  }, [])
  return (
    <>
      <h2>{titleText}</h2>
      <p>{bodyText}</p>
      <h3>- <i>{author}</i></h3>
    </>
  )
}

export default App
