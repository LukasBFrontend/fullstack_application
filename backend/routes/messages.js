const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const validate = validateMessageRequest(db);

  // Get all messages to logged in user
  router.get('/', validate, async (req, res) => {
    let messages = await db.all('SELECT * FROM messages WHERE sender_id = ? OR recipient_id = ?', [
      req.session.userId,
      req.session.userId
    ]);

    messages = await messageMap(db, messages);

    res.status(200).json(messages);
  });

  // GET all messages between logged in user and user with ID
  router.get('/:user_id', validate, async (req, res) => {
    let messages = await db.all('SELECT * FROM messages WHERE (sender_id = ? AND recipient_id = ?) OR (recipient_id = ? AND sender_id = ?)', [
      req.params.user_id,
      req.session.userId,
      req.params.user_id,
      req.session.userId
    ]);

    messages = await messageMap(db, messages);

    res.status(200).json(messages);
  });

  // Send message to user with ID
  router.post('/:user_id', validate,  async (req, res) => {
    const { text } = req.body;

    if ( !text || text.length < 1 || text.length >= 500) return res.status(400).json({ message: 'Message text must be a nonempty string with a maximum of 500 characthers'});

    const message = await db.run('INSERT INTO messages (sender_id, recipient_id, text) VALUES (?, ?, ?)', [
      req.session.userId,
      req.params.user_id,
      text
    ]);

    await db.run('INSERT INTO notifications (user_id, related_user_id, type) VALUES (?, ?, ?)', [
        req.session.userId,
        req.params.user_id,
        'message'
    ]);

    res.status(201).json({ message: `Message sent to user with id: ${req.params.user_id}`});
  });

  // Create message reads for all messages from user with ID to logged in user
  router.get('/:user_id/read', validate, async (req, res) => {
    const recievedMessages = await db.all('SELECT * FROM messages WHERE recipient_id = ? AND sender_id = ?', [
      req.session.userId,
      req.params.user_id
    ]);

    let messageReads = [];

    for (let i = 0; i < recievedMessages.length; i++) {
      const messageRead = await db.get('SELECT * FROM messagereads WHERE message_id = ?', [
        recievedMessages[i].id
      ]);

      if (messageRead) messageReads.push(messageRead);
    }

    for (let i = 0; i < recievedMessages.length; i++) {
      if (messageReads.find(messageRead => messageRead.message_id == recievedMessages[i].id)) continue;

      await db.run('INSERT INTO messagereads (user_id, message_id) VALUES (?, ?)', [
        req.session.userId,
        recievedMessages[i].id
      ])
    };

    await db.run('DELETE FROM notifications WHERE user_id = ? AND related_user_id = ? AND type = ?', [
      req.session.userId,
      req.params.user_id,
      'message'
    ]);

    res.status(200).json({ message: `"Marked all messages from user with id: ${req.params.user_id} as read`});
  });

  return router;
};

// Append relevant information to message and format
async function messageMap(db, messages) {
  let messageReads = [];

  for (let i = 0; i < messages.length; i++) {
    const messageRead = await db.get('SELECT * FROM messagereads WHERE message_id = ?', [
      messages[i].id
    ]);

    if (messageRead) messageReads.push(messageRead);
  }

  return await Promise.all(messages.map(async (message) => {
    let sender = await db.get('SELECT * FROM users WHERE id = ?', [message.sender_id]);
    let recipient = await db.get('SELECT * FROM users WHERE id = ?', [message.recipient_id]);
    sender = { id: sender.id, username: sender.username };
    recipient = { id: recipient.id, username: recipient.username };

    return {
      id: message.id,
      sender: sender,
      recipient: recipient,
      text: message.text,
      created_at: message.created_at,
      read: Boolean(messageReads.find(mr => mr.message_id == message.id))
    };
  }));
}

// Check if user is logged in and alteratively if user with ID exists
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
