const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET all posts
  router.get('/', async (req, res) => {
    const posts = await db.all('SELECT * FROM posts');
    res.json(posts);
  });

  router.post('/create', async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({ message: 'Must be logged in to make posts' });
      return;
    }

    const post = await db.run('INSERT INTO posts (author_id, title_text, body_text) VALUES (?, ?, ?)', [
      req.session.userId,
      req.body.title,
      req.body.text
    ]);

    res.status(201).json(post);
  });

  // GET post by ID
  router.get('/:post_id', async (req, res) => {
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.post_id]);
    if (!post) return res.status(404).send({ error: 'Post not found' });

    const user = await db.get('SELECT * FROM users WHERE id = ?', [post.author_id]);
    res.json({ ...post, author: user });
  });

  return router;
};
