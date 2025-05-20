const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

let database;
(async () => {
  database = await sqlite.open({
    driver: sqlite3.Database,
    filename: 'database.sqlite'
  })

  await database.run('PRAGMA foreign_keys = ON')

  console.log('Redo att göra databasanrop')
})();


const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api', async (req, res) => {
  const messages = await database.all('SELECT * FROM messages');

  console.log(messages);
  res.send({message: messages[0].text});
});

app.get('/api/:post_id', async (req, res) => {
  const post = await database.all('SELECT * FROM posts WHERE id=?', [
    req.params.post_id
  ]);

  const user = await database.all('SELECT * FROM users WHERE id=?', [
    post[0].author_id
  ])
  console.log({...post[0], author: user[0]});

  res.send({...post[0], author: user[0]});
});

app.use(express.static(path.join(path.resolve(), 'dist')));

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
