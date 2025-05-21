const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const validate = validateRequest(db);
  // GET all users
  router.get('/', async (req, res) => {
    const users = await db.all('SELECT * FROM users');
    res.json(users);
  });

  //Logout
  router.post('/logout', (req, res) => {
    if (!req.session.userId) {
      return res.status(400).json({ message: 'Not logged in' });
    }

    req.session.destroy(err => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  //Check if logged in

  router.get('/me', (req, res) => {
    console.log('Session object:', req.session); // Debug line

    if (req.session.userId) {
      res.json({ loggedIn: true, userId: req.session.userId });
    } else {
      res.json({ loggedIn: false });
    }
  });

  // Login
  router.get('/login', async (req, res) => {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [req.body.email]);

    if (user && req.body.password == user.password_hash) {
      req.session.userId = user.id;
      res.status(200).json({ message: `User ${user.username} logged in`, session: req.session });
    } else {
      res.status(401).json({ message: 'Incorrect email or password' });
    }
  });

  // GET user by ID
  router.get('/:user_id', async (req, res) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.user_id]);
    res.json(user);
  });

  router.get('/:user_id/friends', async (req, res) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.user_id]);
    if (!user) {
      return res.status(400).json({ message: `No user with id: ${req.params.user_id} could be found` });
    }

    const friendships = await db.get('SELECT * FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = ?', [
      req.params.user_id,
      req.params.user_id,
      'accepted'
    ]);

    res.status(200).json(friendships);
  });

  router.get('/:user_id/friendship', async (req, res) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.user_id]);
    if (!user) {
      return res.status(400).json({ message: `No user with id: ${req.params.user_id} could be found` });
    }

    const friendship = await db.get('SELECT * FROM friendships WHERE user_id = ? AND friend_id = ? OR friend_id = ? AND user_id = ?', [
      req.session.userId,
      req.params.user_id,
      req.session.userId,
      req.params.user_id
    ]);

    if (!friendship){
      res.status(400).json({ message: 'No such friendship exists'});
      return;
    }

    res.status(200).json(friendship);
  });

  // Send friendrequest
  router.post('/:user_id/friendship', validate, async (req, res) => {

    const friendship = await db.run('INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)', [
      req.session.userId,
      req.params.user_id,
      'pending'
    ]);

    res.status(200).json({ message: `Friend request sent to user with id ${req.params.user_id}`});
  });

  // Answer friendship request
  router.patch('/:user_id/friendship', validate, async (req, res) => {
    const { status } = req.body;

    if (!status || status != 'accepted' && status != 'rejected') {
      res.status(400).json({ message: `Bad value for key 'status': '${status}'. Must be either 'accepted' or 'rejected'`});
      return;
    }

    const friendship = await db.run('SELECT * FROM friendships WHERE user_id = ? AND friend_id = ? OR friend_id = ? AND user_id = ?', [
      req.session.userId,
      req.params.user_id,
      req.session.userId,
      req.params.user_id
    ]);

    if (!friendship){
      res.status(400).json({ message: 'Failed to update friendship status: no such friendship exists'});
      return;
    }

    await db.run('UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ? OR friend_id = ? AND user_id = ?', [
      status,
      req.session.userId,
      req.params.user_id,
      req.session.userId,
      req.params.user_id
    ]);

    res.status(200).json({ message: `Succesfully updated friendship status to '${status}'`});
  });

  router.delete('/:user_id/friendship', validate, async (req, res) => {
    const friendship = await db.run('SELECT * FROM friendships WHERE user_id = ? AND friend_id = ? OR friend_id = ? AND user_id = ?', [
      req.session.userId,
      req.params.user_id,
      req.session.userId,
      req.params.user_id
    ]);

    if (!friendship){
      res.status(400).json({ message: 'Failed to delete friendship status: no such friendship exists'});
      return;
    }

    db.run('DELETE  FROM friendships WHERE user_id = ? AND friend_id = ? OR friend_id = ? AND user_id = ?', [
      req.session.userId,
      req.params.user_id,
      req.session.userId,
      req.params.user_id
    ]);

    res.status(200).json({ message: 'Friendship succesfully deleted'});
  });

  return router;
};

function validateRequest(db) {
  return async (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Must be logged in to view or send messages' });
    }

    if (req.params.user_id) {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.user_id]);
      if (!user) {
        return res.status(400).json({ message: `No user with id: ${req.params.user_id} could be found` });
      }
    }

    next();
  };
}
