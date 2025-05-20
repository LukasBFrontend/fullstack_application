DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS posts;

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY(sender_id) REFERENCES users(id),
  FOREIGN KEY(recipient_id) REFERENCES users(id),
  CHECK (LENGTH(text) > 0),
  CHECK (sender_id <> recipient_id)
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL,
  title_text TEXT NOT NULL,
  body_text TEXT NOT NULL,
  CHECK (LENGTH(title_text) > 0 & LENGTH(title_text) < 20),
  CHECK (LENGTH(body_text) > 0 & LENGTH(body_text) < 300),
  FOREIGN KEY(author_id) REFERENCES users(id)
);

INSERT INTO users (username) VALUES
('Ronnie Coleman'),
('Lukas');

INSERT INTO messages (sender_id, recipient_id, text) VALUES
(1, 2, 'Tjenamors!');

INSERT INTO posts (author_id, title_text, body_text) VALUES
(1, 'My muskles are getting bigger', 'Yeah buddy! Lightweight baby! Yup!');
