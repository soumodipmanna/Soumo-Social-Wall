import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), 'db', 'social_wall.db');
const SCHEMA_PATH = path.join(process.cwd(), 'db', 'schema.sql');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new sqlite3.Database(DB_PATH);

function runSchema() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

runSchema();

db.exec('PRAGMA foreign_keys = ON;');

app.use(cors());
app.use(express.json());

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/posts', asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const params = [];
  let where = '';
  if (search) {
    where = 'WHERE LOWER(posts.username) LIKE ? OR LOWER(posts.text) LIKE ?';
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }
  const rows = await all(
    `
    SELECT posts.*,
      COUNT(comments.id) as commentCount
    FROM posts
    LEFT JOIN comments ON comments.post_id = posts.id
    ${where}
    GROUP BY posts.id
    ORDER BY datetime(posts.created_at) DESC
    `,
    params
  );
  const posts = rows.map((row) => ({
    ...row,
    likes: Number(row.likes || 0),
    commentCount: Number(row.commentCount || 0),
    likedBy: [],
  }));
  res.json(posts);
}));

app.get('/api/posts/:id', asyncHandler(async (req, res) => {
  const row = await get(
    `
    SELECT posts.*,
      COUNT(comments.id) as commentCount
    FROM posts
    LEFT JOIN comments ON comments.post_id = posts.id
    WHERE posts.id = ?
    GROUP BY posts.id
    `,
    [req.params.id]
  );
  if (!row) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }
  res.json({
    ...row,
    likes: Number(row.likes || 0),
    commentCount: Number(row.commentCount || 0),
    likedBy: [],
  });
}));

app.post('/api/posts', asyncHandler(async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const text = String(req.body.text || '').trim();
  const imageUrl = String(req.body.image_url || '').trim() || null;
  if (!username || !text) {
    res.status(400).json({ message: 'Username and text are required' });
    return;
  }
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await run(
    `
    INSERT INTO posts (id, username, text, image_url, likes, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
    `,
    [id, username, text, imageUrl, createdAt]
  );
  res.status(201).json({
    id,
    username,
    text,
    image_url: imageUrl || undefined,
    likes: 0,
    commentCount: 0,
    likedBy: [],
    created_at: createdAt,
  });
}));

app.delete('/api/posts/:id', asyncHandler(async (req, res) => {
  await run('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.status(204).send();
}));

app.post('/api/posts/:id/like', asyncHandler(async (req, res) => {
  const postId = req.params.id;
  await run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
  const row = await get(
    `
    SELECT posts.*,
      COUNT(comments.id) as commentCount
    FROM posts
    LEFT JOIN comments ON comments.post_id = posts.id
    WHERE posts.id = ?
    GROUP BY posts.id
    `,
    [postId]
  );
  if (!row) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }
  res.json({
    ...row,
    likes: Number(row.likes || 0),
    commentCount: Number(row.commentCount || 0),
    likedBy: [],
  });
}));

app.get('/api/posts/:id/comments', asyncHandler(async (req, res) => {
  const rows = await all(
    `
    SELECT *
    FROM comments
    WHERE post_id = ?
    ORDER BY datetime(created_at) ASC
    `,
    [req.params.id]
  );
  res.json(rows);
}));

app.post('/api/posts/:id/comments', asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const username = normalizeUsername(req.body.username);
  const comment = String(req.body.comment || '').trim();
  if (!username || !comment) {
    res.status(400).json({ message: 'Username and comment are required' });
    return;
  }
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await run(
    `
    INSERT INTO comments (id, post_id, username, comment, created_at)
    VALUES (?, ?, ?, ?, ?)
    `,
    [id, postId, username, comment, createdAt]
  );
  res.status(201).json({
    id,
    post_id: postId,
    username,
    comment,
    created_at: createdAt,
  });
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
