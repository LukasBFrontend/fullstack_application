const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const validate = validateMessageRequest(db);

  // Get all messages to logged in user

  router.get('/', validate, async (req, res) => {
    const messages = await db.all('SELECT * FROM messages WHERE sender_id = ? OR recipient_id = ?', [
      req.session.userId,
      req.session.userId
    ]);
    res.status(200).json(messages);
  });

  // GET all messages between two users
  router.get('/:user_id', validate, async (req, res) => {
    const messages = await db.all('SELECT * FROM messages WHERE sender_id = ? AND recipient_id = ? OR recipient_id = ? AND sender_id = ?', [
      req.params.user_id,
      req.session.userId,
      req.params.user_id,
      req.session.userId
    ]);
    res.status(200).json(messages);
  });

  //Send message to user
  router.post('/:user_id', validate,  async (req, res) => {
    const { text } = req.body;
    const message = await db.run('INSERT INTO messages (sender_id, recipient_id, text) VALUES (?, ?, ?)', [
      req.session.userId,
      req.params.user_id,
      text
    ]);

    res.status(201).json({ message: `Message sent to user with id: ${req.params.user_id}`});
  });

  return router;
};

function validateMessageRequest(db) {
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
