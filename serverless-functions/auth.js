import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE',
};

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { users: [] };
  }
}

async function writeDb(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  try {
    const { email, password } = req.body;
    const db = await readDb();

    if (req.url === '/api/auth/signup') {
      const existingUser = db.users.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists.' });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password, // In production, HASH THIS PASSWORD!
        credits: 4, // Initial daily credits
        lastCreditReset: new Date().toISOString(),
        token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, // Simple token
      };
      db.users.push(newUser);
      await writeDb(db);
      return res.status(201).json({ user: { id: newUser.id, email: newUser.email, full_name: email.split('@')[0] }, token: newUser.token });
    }

    if (req.url === '/api/auth/signin') {
      const user = db.users.find(u => u.email === email && u.password === password); // In production, COMPARE HASHED PASSWORDS!
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      return res.status(200).json({ user: { id: user.id, email: user.email, full_name: email.split('@')[0] }, token: user.token });
    }

    if (req.url === '/api/auth/delete-account' && req.method === 'DELETE') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Authentication token required.' });
      }

      const userIndex = db.users.findIndex(u => u.token === token);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found or invalid token.' });
      }

      const deletedUser = db.users.splice(userIndex, 1);
      await writeDb(db);
      return res.status(200).json({ message: `Account for ${deletedUser[0].email} deleted successfully.` });
    }

    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    console.error('Error in auth serverless function:', error);
    return res.status(500).json({ error: error.message || 'Unknown error in authentication.' });
  }
}