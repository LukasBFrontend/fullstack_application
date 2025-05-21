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

  // Send friendrequest
  router.post('/:user_id/add_friend', validate, async (req, res) => {

  });

  // Answer friendship request
  router.patch('/:user_id/answer_request', validate, async (req, res) => {

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
