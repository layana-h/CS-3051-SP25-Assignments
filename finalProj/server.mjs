import express from 'express'; 
// listens for people visiting pages or sending forms, then sends back what they asked for (like HTML or data)

import cookieParser from 'cookie-parser';

import bcrypt from 'bcrypt';

import fs from 'fs/promises'; 
// to read/write files using async/await — like saving and loading notes, users, or trips to/from a file

import path from 'path'; 
// helps build file paths safely across all operating systems

import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url); 

const __dirname = path.dirname(__filename); 

const app = express(); 

const DB_PATH = path.join(__dirname, 'db.json'); 


// middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// initialize DB
async function initDB() {
  let data;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    data = JSON.parse(raw);
    if (!data.users) data.users = {};
    if (!data.trips) data.trips = {};
  } catch {
    data = { users: {}, trips: {} };
  }
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}
initDB();

// DB helpers
async function readDB() {
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}
async function writeDB(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// session cookie middleware
app.use((req, res, next) => {
  if (!req.cookies.userId) {
    res.cookie('userId', Date.now().toString(), {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }
  next();
});

// trips API
app.get('/api/trips', async (req, res) => {
  const db    = await readDB();
  const list  = db.trips[req.cookies.userId] || [];
  res.json({ trips: list });
});
app.post('/api/trips', async (req, res) => {
  const db = await readDB();
  db.trips[req.cookies.userId] = req.body.trips || [];
  await writeDB(db);
  res.json({ ok: true });
});

// ——— Auth API ———

// sign up
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = await readDB();
  if (Object.values(db.users).some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username taken' });
  }
  const userId       = Date.now().toString();
  const passwordHash = await bcrypt.hash(password, 10);
  db.users[userId] = { username, passwordHash };
  await writeDB(db);
  res.cookie('userId', userId, { httpOnly: true, maxAge: 30*24*60*60*1000 });
  res.json({ ok: true, user: { username } });
});

// log in
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await readDB();
  const entry = Object.entries(db.users)
    .find(([id, u]) => u.username === username);
  if (!entry) return res.status(400).json({ error: 'Invalid credentials' });
  const [userId, user] = entry;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Username or password is incorrect'});
  res.cookie('userId', userId, { httpOnly: true, maxAge: 30*24*60*60*1000 });
  res.json({ ok: true, user: { username } });
});

// log out
app.post('/api/logout', (req, res) => {
  res.cookie('userId', '', { maxAge: 0 });
  res.json({ ok: true });
});

// user
app.get('/api/me', async (req, res) => {
  const db = await readDB();
  const user = db.users[req.cookies.userId];
  res.json({ user: user ? { username: user.username } : null });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});