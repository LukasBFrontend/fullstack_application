const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const authorize = authorizeUser();

  // GET all notifications for the logged in user
  router.get('/', authorize, async (req, res) => {
    try {
      let notifications = await db.all('SELECT * FROM notifications WHERE user_id = ?', [
        req.session.userId
      ]);

      notifications = await notificationMap(db, notifications);

      res.status(200).json(notifications);
    }
    catch (err) {
      console.error('Failed to retrieve notifications:', err);
      return res.status(500).json({ message: 'Could not retrieve notifications from database'});
    }
  });

  // DELETE all notifications for the logged in user
  router.delete('/', authorize, async (req, res) => {
    try {
      await db.run('DELETE FROM notifications WHERE user_id = ?', [
        req.session.userId
      ]);

      res.status(200).json({message: `All notifications for user with id: ${req.session.userId} have been deleted`});
    }
    catch (err) {
      console.error('Failed to delete notifications:', err);
      return res.status(500).json({ message: 'Could not delete notifications from database'});
    }
  });

  return router;
};

async function notificationMap (db, notifications) {
  try {
    return await Promise.all(notifications.map(async notification => {
      const relatedUser = await db.get('SELECT * FROM users WHERE id = ?', [
        notification.related_user_id
      ]);

      const {id, user_id, type, created_at} = notification;
      return { id, user_id, type, related_user: {id: relatedUser.id, username: relatedUser.username}, created_at };
    }));
  }
  catch (err) {
    console.error('Server error while mapping notification:', err);
  }
}

// Check if the user is logged in
function authorizeUser() {
  return (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Must be logged in' });

    next();
  }
};
