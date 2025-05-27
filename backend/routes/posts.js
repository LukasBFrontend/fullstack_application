const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const authorize = authorizeUser(db);
  const postCheck = findPost(db);

  // GET all posts / search for post / GET all posts by author with id
  router.get('/', async (req, res) => {
    const { search, author_id } = req.query;

    try {
      let posts = null

      if (search){
        posts = await db.all('SELECT * FROM posts WHERE title_text LIKE ?', [`%${search}%`]);
      }
      else if (author_id) {
        posts = await db.all('SELECT * FROM posts WHERE author_id = ?', [author_id]);
      }
      else {
        posts = await db.all('SELECT * FROM posts');
      }

      posts = await Promise.all(posts.map(post => formatPost(db, post, req.session.userId)));

      res.status(200).json(posts);
    }
    catch (err) {
      console.error('Failed to retrieve posts:', err);
      return res.status(500).json({ message: 'Could not retrieve posts from database'});
    }
  });

  // CREATE post
  router.post('/create', authorize, async (req, res) => {
    const { title, text } = req.body;

    if (!title || title.length < 1 || title.length > 100){
      return res.status(400).json({ message: 'Title must be of string format and between 1 and 100 characters'})
    };

    if (!text || text.length < 1 || text.length > 500){
      return res.status(400).json({ message: 'Text must be of string format and between 1 and 500 characters'})
    };

    try {
      const post = await db.run('INSERT INTO posts (author_id, title_text, body_text) VALUES (?, ?, ?)', [
        req.session.userId,
        title,
        text
      ]);

      // Create notification for all friends START
      const friendships = await db.all('SELECT * FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = ?', [
        req.session.userId,
        req.session.userId,
        'accepted'
      ]);

      for (let i = 0; i < friendships.length; i++) {
        const friendId = req.session.userId == friendships[i].user_id ? friendships[i].friend_id : friendships[i].user_id;
        await db.run('INSERT INTO notifications (user_id, related_user_id, type) VALUES (?, ?, ?)', [
          req.session.userId,
          friendId,
          'post'
        ]);
      }
      // Create notification for all friends END

      res.status(201).json({ message: 'Post created', postId: post.lastID });
    }
    catch (err) {
      console.error('Failed to create post:', err);
      return res.status(500).json({ message: 'Server error while creating post'});
    }
  });

  // GET post by ID
  router.get('/:post_id', async (req, res) => {
    try {
      let post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.post_id]);

      if (!post) return res.status(404).send({ error: 'Post not found' });
      post = await formatPost(db, post, req.session.userId);
      res.status(200).json(post);
    }
    catch (err) {
      console.error('Failed to retrieve post:', err);
      return res.status(500).json({ message: 'Could not retrieve post from database'});
    }
  });

  // Like a post
  router.post('/:post_id/like', authorize, postCheck, async (req, res) => {
    try {
      await db.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [
        req.session.userId,
        req.params.post_id
      ]);

      const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.post_id]);

      await db.run('INSERT INTO notifications (user_id, related_user_id, type) VALUES (?, ?, ?)', [
        req.session.userId,
        post.author_id,
        'like'
      ]);

      res.status(200).json({ message: `Liked post with id: ${req.params.post_id}`});
    }
    catch (err) {
      console.error('Failed to like post:', err);
      return res.status(500).json({ message: 'Server error while liking post'});
    }
  });

  // Unlike a post
  router.delete('/:post_id/like', authorize, postCheck, async (req, res) => {
    try {
      await db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [
        req.session.userId,
        req.params.post_id
      ]);

      res.status(200).json({ message: `Removed like from post with id: ${req.params.post_id}`});
    }
    catch (err) {
      console.error('Failed to remove like:', err);
      return res.status(500).json({ message: 'Server error while removing like'});
    }
  });

  // POST a comment
  router.post('/:post_id/comment', authorize, postCheck, async (req, res) => {
    const { text } = req.body;

    if (!text || text.length < 1 || text.length > 250){
      return res.status(400).json({ message: 'Comment must be a string and between 1 and 250 characters'});
    }

    try {
      await db.run('INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)', [
        req.session.userId,
        req.params.post_id,
        text
      ]);

      const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.post_id]);

      await db.run('INSERT INTO notifications (user_id, related_user_id, type) VALUES (?, ?, ?)', [
        post.author_id,
        req.session.userId,
        'comment'
      ]);

      res.status(200).json({ message: `Commented "${text}" on post with id: ${post.id}`});
    }
    catch (err) {
      console.error('Failed to post comment:', err);
      return res.status(500).json({ message: 'Could not post comment to database'});
    }
  });

  return router;
};

// Complement post object with more information from db
async function formatPost(db, post, userId) {
  try {
    const {id, title_text, body_text, created_at, author_id} = post;

    const author = await db.get('SELECT * FROM users WHERE id = ?', [
      author_id
    ]);

    const liked = userId
    ? await db.get('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [
      userId,
      id
    ])
    : null;

    const likes = await db.all('SELECT * FROM likes WHERE post_id = ?', [
      id
    ]);

    let comments = await db.all('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC', [
      id
    ]);

    comments = await Promise.all(comments.map(async comment => {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [comment.user_id]);
      return {
        comment_id: comment.id,
        user: { id: user.id, name: user.username },
        text: comment.text,
        created_at: comment.created_at
      };
    }));

    return {
      id,
      author: author ? { id: author.id, username: author.username} : null,
      title_text,
      body_text,
      likes: likes ? likes.length : 0,
      liked_by_user: Boolean(liked),
      comments: comments,
      created_at
    };
  }
  catch (err) {
    console.error('Failed to format post:', err);
    return res.status(500).json({ message: 'Server error while formatting post'});
  }

}

// Check if user is logged in
function authorizeUser(db) {
  return (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Must be logged in' });

    next();
  }
};

// Check if post exists
function findPost(db) {
  return async (req, res, next) => {
    try {
      const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.post_id]);

      if (!post) return res.status(404).send({ error: 'Post not found' });
    }
    catch (err) {
      console.error('Failed to retrieve post:', err);
      return res.status(500).json({ message: 'Could not retrieve post from database'});
    }

    next();
  }
};
