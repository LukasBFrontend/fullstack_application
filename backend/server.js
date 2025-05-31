const express = require('express');
const session = require('express-session');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

let database;
(async () => {
  database = await sqlite.open({
    driver: sqlite3.Database,
    filename: 'database.sqlite'
  });

  await database.run('PRAGMA foreign_keys = ON');
  console.log('Database ready');

  app.use('/api/posts', require('./routes/posts')(database));
  app.use('/api/users', require('./routes/users')(database));
  app.use('/api/messages', require('./routes/messages')(database));
  app.use('/api/notifications', require('./routes/notifications')(database));

  app.use(express.static(path.join(path.resolve(), 'dist')));

  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}`);
  });
})();
