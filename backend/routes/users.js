const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const authorize = authorizeUser();
  const checkUserExists = findUser(db);
  const friendCheck = findFriendship(db);

  // GET all users / search for user
  router.get('/', async (req, res) => {
    try {
      const { search } = req.query;
      let users = null;

      if (search) {
        users = await db.all('SELECT * FROM users WHERE username LIKE ?', [`%${search}%`]);
      }
      else {
        users = await db.all('SELECT * FROM users');
      }

      for (let i = 0; i < users.length; i++) {
        delete users[i].password_hash;
      }
      res.status(200).json(users);
    }
    catch (err) {
      console.error('Failed to retrieve users:', err);
      return res.status(500).json({ message: 'Could not retrieve users from database'});
    }
  });

  // Logout
  router.post('/logout', authorize, (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Check if logged in
  router.get('/me', (req, res) => {
    if (req.session.userId) {
      res.json({ loggedIn: true, userId: req.session.userId });
    } else {
      res.json({ loggedIn: false });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

      if (user && password == user.password_hash) {
        req.session.userId = user.id;
        res.status(200).json({ message: `User ${user.username} logged in`, session: req.session });
      } else {
        res.status(401).json({ message: 'Incorrect email or password' });
      }
    }
    catch (err) {
      console.error('Failed to retrieve user:', err);
      return res.status(500).json({ message: 'Could not retrieve user from database'});
    }
  });

  // GET user by ID
  router.get('/:user_id', async (req, res) => {
    try {
      let user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.user_id]);

      if (!user) return res.status(404).json({ message: `User with id: ${req.params.user_id} not found`});

      delete user.password_hash;
      res.status(200).json(user);
    }
    catch (err) {
      console.error('Failed to retrieve user:', err);
      return res.status(500).json({ message: 'Could not retrieve user from database'});
    }
  });

  // GET all friends of user with ID
  router.get('/:user_id/friends', checkUserExists, async (req, res) => {
    try {
      let friendships = await db.all('SELECT * FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = ?', [
        req.params.user_id,
        req.params.user_id,
        'accepted'
      ]);

      for (let i = 0; i < friendships.length; i++) {
        const friendId = req.params.user_id == friendships[i].user_id ? friendships[i].friend_id : friendships[i].user_id;

        const friend = await db.get('SELECT * FROM users WHERE id = ?', [
          friendId
        ]);

        friendships[i] = { id: friend.id, username: friend.username }
      }

      res.status(200).json(friendships);
    }
    catch (err) {
      console.error('Failed to retrieve friends:', err);
      return res.status(500).json({ message: 'Could not retrieve friends from database'});
    }
  });

  // GET friendship status between logged in user and user with ID
  router.get('/:user_id/friendship', checkUserExists, async (req, res) => {
    try {
      const friendship = await db.get('SELECT * FROM friendships' + friendshipQuery, [
        req.session.userId,
        req.params.user_id,
        req.session.userId,
        req.params.user_id
      ]);

      if (!friendship){
        res.status(404).json({ message: 'No such friendship exists'});
        return;
      }

      res.status(200).json(friendship);
    }
    catch (err) {
      console.error('Failed to retrieve friendship status:', err);
      return res.status(500).json({ message: 'Could not retrieve friendship status from database'});
    }
  });

  // Send friendrequest
  router.post('/:user_id/friendship', authorize, checkUserExists, async (req, res) => {
    if (req.session.userId == req.params.user_id) return res.status(400).json({ message: "Can't send friendrequests to self"});

    try {
      const friendship = await db.get('SELECT * FROM friendships' + friendshipQuery, [
        req.session.userId,
        req.params.user_id,
        req.session.userId,
        req.params.user_id
      ]);

      if (friendship) return res.status(400).json({ message: `Friendship relation for user with id: ${req.params.user_id} already exists`});

      await db.run('INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)', [
        req.session.userId,
        req.params.user_id,
        'pending'
      ]);

      res.status(200).json({ message: `Friend request sent to user with id ${req.params.user_id}`});
    }
    catch (err) {
      console.error('Failed to send friendrequest:', err);
      return res.status(500).json({ message: 'Database error while sending friend request'});
    }
  });

  // Answer friendship request
  router.patch('/:user_id/friendship', authorize, checkUserExists, friendCheck, async (req, res) => {
    if (req.session.userId == req.params.user_id) return res.status(400).json({ message: "Can't answer friendrequests from self"});

    const { status } = req.body;

    if (!status || status != 'accepted' && status != 'rejected') {
      res.status(400).json({ message: `Bad value for key 'status': '${status}'. Must be either 'accepted' or 'rejected'`});
      return;
    }

    try {
      await db.run('UPDATE friendships SET status = ?' + friendshipQuery, [
        status,
        req.session.userId,
        req.params.user_id,
        req.session.userId,
        req.params.user_id
      ]);

      res.status(200).json({ message: `Successfully updated friendship status to '${status}'`});
    }
    catch (err) {
      console.error('Failed to answer friendship request:', err);
      return res.status(500).json({ message: 'Server error while answering friendship request'});
    }
  });

  // DELETE friendship relation
  router.delete('/:user_id/friendship', authorize, checkUserExists, friendCheck, async (req, res) => {
    try {
      await db.run('DELETE FROM friendships' + friendshipQuery, [
        req.session.userId,
        req.params.user_id,
        req.session.userId,
        req.params.user_id
      ]);

      res.status(200).json({ message: 'Friendship succesfully deleted'});
    }
    catch (err) {
      console.error('Failed to delete friendship:', err);
      return res.status(500).json({ message: 'Could not delete friendship from database'});
    }
  });

  return router;
};

const friendshipQuery = ' WHERE (user_id = ? AND friend_id = ?) OR (friend_id = ? AND user_id = ?)';

// Check if user is logged in
function authorizeUser() {
  return (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Must be logged in' });

    next();
  }
};

// Check if a user with ID exists
function findUser(db) {
  return async (req, res, next) => {
    try {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.user_id]);

      if (!user) return res.status(404).json({ message: `No user with id: ${req.params.user_id} could be found` });
    }
    catch (err) {
      console.error('Failed to retrieve user:', err);
      return res.status(500).json({ message: 'Could not retrieve user from database'});
    }

    next();
  }
};

// Check if friendship relation exists between logged in user and user with ID
function findFriendship(db) {
  return async (req, res, next) => {
    try {
      const friendship = await db.get('SELECT * FROM friendships' + friendshipQuery, [
        req.session.userId,
        req.params.user_id,
        req.session.userId,
        req.params.user_id
      ]);

      if (!friendship){
        res.status(400).json({ message: 'Failed to get friendship status: no such friendship exists'});
        return;
      }
    }
    catch (err) {
      console.error('Failed to retrieve friendship:', err);
      return res.status(500).json({ message: 'Could not retrieve friendship from database'});
    }

    next();
  }
};
