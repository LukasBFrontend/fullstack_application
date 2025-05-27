DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS messagereads;

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  biography TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (LENGTH(username) > 1 AND LENGTH(username) < 30),
  CHECK (LENGTH(email) > 0 AND LENGTH(email) < 40)
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL,
  title_text TEXT NOT NULL,
  body_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (LENGTH(title_text) > 0 AND LENGTH(title_text) < 50),
  CHECK (LENGTH(body_text) < 300),
  FOREIGN KEY(author_id) REFERENCES users(id)
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(sender_id) REFERENCES users(id),
  FOREIGN KEY(recipient_id) REFERENCES users(id),
  CHECK (LENGTH(text) > 0),
  CHECK (sender_id <> recipient_id)
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  related_user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN('message', 'like', 'comment', 'post')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT false,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(related_user_id) REFERENCES users(id)
);

CREATE TABLE friendships (
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  FOREIGN KEY(user_id) references users(id),
  FOREIGN KEY(friend_id) references users(id),
  CHECK (user_id <> friend_id),
  PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE comments(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) references users(id),
  FOREIGN KEY(post_id) references users(id),
  CHECK (LENGTH(text) > 0)
);

CREATE TABLE likes (
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY(user_id) references users(id),
  FOREIGN KEY(post_id) references users(id),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE messagereads (
  user_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) references users(id),
  FOREIGN KEY(message_id) references messages(id),
  PRIMARY KEY (user_id, message_id)
);

INSERT INTO users (username, email, password_hash) VALUES
('RonnieColeman', 'ronnie@example.com', 'hashed_pw1'),
('LukasDev', 'lukas@example.com', 'hashed_pw2'),
('JaneDoe', 'jane@example.com', 'hashed_pw3'),
('MaxPower', 'max@example.com', 'hashed_pw4');

INSERT INTO posts (author_id, title_text, body_text) VALUES
(1, 'Leg Day Tips', 'Train insane or remain the same.'),
(2, 'React vs Vue', 'My take on frontend frameworks.'),
(3, 'Hello World', 'This is my first post on this platform.');

INSERT INTO messages (sender_id, recipient_id, text) VALUES
(1, 2, 'Lightweight baby!'),
(2, 1, 'Haha, yeah buddy!'),
(3, 2, 'Loved your last post!');

INSERT INTO notifications (user_id, related_user_id, type) VALUES
(2, 1, 'message'),
(1, 3, 'comment'),
(3, 2, 'like');

INSERT INTO friendships (user_id, friend_id, status) VALUES
(1, 2, 'accepted'),
(2, 3, 'pending'),
(3, 4, 'accepted');

INSERT INTO comments (user_id, post_id, text) VALUES
(2, 1, 'Great advice!'),
(3, 2, 'I prefer Vue, but good points.'),
(4, 3, 'Welcome to the platform!');

INSERT INTO likes (user_id, post_id) VALUES
(2, 1),
(3, 1),
(3, 2),
(4, 3);

INSERT INTO messagereads (user_id, message_id) VALUES
(2, 1),
(1, 2),
(2, 3);
