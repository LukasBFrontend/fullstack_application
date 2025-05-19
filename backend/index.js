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
  const messages = await database.all('SELECT message FROM test');

  console.log(messages);
  res.send({message: messages[0].message});
})

app.use(express.static(path.join(path.resolve(), 'dist')));

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
