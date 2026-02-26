import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import fs from 'fs';
import RSS from 'rss';

const db = new Database('portfolio.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    email TEXT,
    avatar_url TEXT,
    provider TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES blog_posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    pricing TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    level INTEGER,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT,
    position TEXT,
    duration TEXT,
    description TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'cyberpunk-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser((id: string, done) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user);
  });

  // OAuth Strategies (Conditional on env vars)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL}/auth/google/callback`
    }, (accessToken, refreshToken, profile, done) => {
      let user = db.prepare('SELECT * FROM users WHERE id = ?').get(profile.id);
      if (!user) {
        db.prepare('INSERT INTO users (id, username, email, avatar_url, provider) VALUES (?, ?, ?, ?, ?)')
          .run(profile.id, profile.displayName, profile.emails?.[0]?.value, profile.photos?.[0]?.value, 'google');
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(profile.id);
      }
      return done(null, user);
    }));
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL}/auth/github/callback`
    }, (accessToken: string, refreshToken: string, profile: any, done: any) => {
      let user = db.prepare('SELECT * FROM users WHERE id = ?').get(profile.id);
      if (!user) {
        db.prepare('INSERT INTO users (id, username, email, avatar_url, provider) VALUES (?, ?, ?, ?, ?)')
          .run(profile.id, profile.username, profile.emails?.[0]?.value, profile.photos?.[0]?.value, 'github');
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(profile.id);
      }
      return done(null, user);
    }));
  }

  // Auth Routes
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.send(`<html><body><script>window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');window.close();</script></body></html>`);
  });

  app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.send(`<html><body><script>window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');window.close();</script></body></html>`);
  });

  app.get('/api/me', (req: any, res) => res.json(req.user || null));

  // RSS Feed
  app.get('/rss.xml', (req, res) => {
    const feed = new RSS({
      title: 'Neon Terminal Blog',
      description: 'Data logs from the digital frontier.',
      feed_url: `${process.env.APP_URL}/rss.xml`,
      site_url: process.env.APP_URL || '',
      language: 'en',
    });

    const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
    posts.forEach((post: any) => {
      feed.item({
        title: post.title,
        description: post.excerpt,
        url: `${process.env.APP_URL}/blog/${post.slug}`,
        date: post.created_at,
      });
    });

    res.set('Content-Type', 'text/xml');
    res.send(feed.xml());
  });

  app.get('/api/logout', (req: any, res) => {
    req.logout(() => res.json({ success: true }));
  });

  // Blog API
  app.get('/api/posts', (req, res) => {
    const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
    res.json(posts);
  });

  app.get('/api/posts/:slug', (req, res) => {
    const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comments = db.prepare(`
      SELECT c.*, u.username, u.avatar_url 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = ? 
      ORDER BY c.created_at DESC
    `).all(post.id);
    res.json({ ...post, comments });
  });

  app.post('/api/posts/:slug/comments', (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { content } = req.body;
    const post = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)')
      .run(post.id, (req.user as any).id, content);
    res.json({ success: true });
  });

  // Services API
  app.get('/api/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  });

  // Skills API
  app.get('/api/skills', (req, res) => {
    const skills = db.prepare('SELECT * FROM skills').all();
    res.json(skills);
  });

  // Experience API
  app.get('/api/experience', (req, res) => {
    const experience = db.prepare('SELECT * FROM experience').all();
    res.json(experience);
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Seed Data if empty
function seed() {
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get().count;
  if (postsCount === 0) {
    db.prepare(`INSERT INTO blog_posts (title, slug, content, excerpt, category, tags) VALUES (?, ?, ?, ?, ?, ?)`).run(
      'The Future of Cybernetic Enhancements',
      'future-of-cybernetics',
      '# Welcome to the Future\n\nCybernetics is not just about replacing limbs anymore. It is about enhancing the human experience...',
      'Exploring the intersection of biology and technology in the 21st century.',
      'Technology',
      'cyber,future,tech'
    );
    
    db.prepare(`INSERT INTO services (id, name, description, pricing, image) VALUES (?, ?, ?, ?, ?)`).run(
      'web-dev',
      'Full-Stack Web Development',
      'Building high-performance, secure, and scalable web applications with a focus on modern architectures.',
      'Starting at $2000',
      'https://picsum.photos/seed/web/800/600'
    );

    db.prepare(`INSERT INTO skills (name, level, category) VALUES (?, ?, ?)`).run('React', 95, 'Frontend');
    db.prepare(`INSERT INTO skills (name, level, category) VALUES (?, ?, ?)`).run('Node.js', 90, 'Backend');
    db.prepare(`INSERT INTO skills (name, level, category) VALUES (?, ?, ?)`).run('TypeScript', 85, 'Language');

    db.prepare(`INSERT INTO experience (company, position, duration, description) VALUES (?, ?, ?, ?)`).run(
      'Neo-Tokyo Tech',
      'Senior Systems Architect',
      '2022 - Present',
      'Designing distributed systems for the next generation of smart cities.'
    );
  }
}

seed();
startServer();
