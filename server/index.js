const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Datastore = require('nedb-promises');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'amar_srity_secret';

app.use(cors());
app.use(express.json());

const users = Datastore.create({ filename: path.join(__dirname, 'users.db'), autoload: true });
const tasks = Datastore.create({ filename: path.join(__dirname, 'tasks.db'), autoload: true });
const notes = Datastore.create({ filename: path.join(__dirname, 'notes.db'), autoload: true });

users.ensureIndex({ fieldName: 'username', unique: true });

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'লগইন প্রয়োজন' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'অবৈধ টোকেন' });
  }
}

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { username, password, full_name } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'সব তথ্য প্রয়োজন' });
  }
  const existing = await users.findOne({ username });
  if (existing) {
    return res.status(400).json({ error: 'ব্যবহারকারী নাম ইতিমধ্যে আছে' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const doc = await users.insert({ username, password: hashedPassword, full_name, created_at: new Date().toISOString() });
  const token = jwt.sign({ userId: doc._id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: doc._id, username, full_name } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'ব্যবহারকারী নাম এবং পাসওয়ার্ড প্রয়োজন' });
  }
  const user = await users.findOne({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'ভুল ব্যবহারকারী নাম বা পাসওয়ার্ড' });
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user._id, username: user.username, full_name: user.full_name } });
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await users.findOne({ _id: req.userId });
  if (!user) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });
  res.json({ id: user._id, username: user.username, full_name: user.full_name });
});

// Task Routes
app.get('/api/tasks', authMiddleware, async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const taskList = await tasks.find({ user_id: req.userId, date: targetDate }).sort({ created_at: -1 });
  res.json(taskList.map(t => ({ ...t, id: t._id })));
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  const { title, description, date } = req.body;
  if (!title) return res.status(400).json({ error: 'কাজের শিরোনাম প্রয়োজন' });
  const targetDate = date || new Date().toISOString().split('T')[0];
  const doc = await tasks.insert({ user_id: req.userId, title, description: description || '', date: targetDate, completed: false, created_at: new Date().toISOString() });
  res.json({ ...doc, id: doc._id });
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  const { title, description, completed } = req.body;
  const task = await tasks.findOne({ _id: req.params.id, user_id: req.userId });
  if (!task) return res.status(404).json({ error: 'কাজ পাওয়া যায়নি' });
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (completed !== undefined) updates.completed = completed;
  await tasks.update({ _id: req.params.id }, { $set: updates });
  const updated = await tasks.findOne({ _id: req.params.id });
  res.json({ ...updated, id: updated._id });
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  const task = await tasks.findOne({ _id: req.params.id, user_id: req.userId });
  if (!task) return res.status(404).json({ error: 'কাজ পাওয়া যায়নি' });
  await tasks.remove({ _id: req.params.id });
  res.json({ message: 'কাজ মুছে ফেলা হয়েছে' });
});

// Notes Routes
app.get('/api/notes', authMiddleware, async (req, res) => {
  const { date } = req.query;
  let noteList;
  if (date) {
    noteList = await notes.find({ user_id: req.userId, date }).sort({ created_at: -1 });
  } else {
    noteList = await notes.find({ user_id: req.userId }).sort({ created_at: -1 }).limit(30);
  }
  res.json(noteList.map(n => ({ ...n, id: n._id })));
});

app.post('/api/notes', authMiddleware, async (req, res) => {
  const { content, date, day, mood } = req.body;
  if (!content) return res.status(400).json({ error: 'নোটের বিষয়বস্তু প্রয়োজন' });
  const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetDay = day || banglaDays[new Date(targetDate).getDay()];
  const doc = await notes.insert({ user_id: req.userId, content, date: targetDate, day: targetDay, mood: mood || 'neutral', created_at: new Date().toISOString() });
  res.json({ ...doc, id: doc._id });
});

app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  const note = await notes.findOne({ _id: req.params.id, user_id: req.userId });
  if (!note) return res.status(404).json({ error: 'নোট পাওয়া যায়নি' });
  await notes.remove({ _id: req.params.id });
  res.json({ message: 'নোট মুছে ফেলা হয়েছে' });
});

// Dashboard Route
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const dayTasks = await tasks.find({ user_id: req.userId, date: targetDate });
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter(t => t.completed === true).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const dayName = banglaDays[new Date(targetDate).getDay()];

  let message = '';
  let emoji = '';
  let mood = '';

  if (totalTasks === 0) {
    message = 'আজকে কোনো কাজ যোগ করা হয়নি। এখনই আপনার দৈনিক কাজগুলো যোগ করুন!';
    emoji = '📝';
    mood = 'info';
  } else if (percentage < 50) {
    message = `আজকে আপনি মাত্র ${percentage}% কাজ সম্পন্ন করেছেন। এটা একটু কম। কিন্তু চিন্তা করবেন না! প্রতিটি ছোট পদক্ষেপই গুরুত্বপূর্ণ। আপনি পারবেন! এগিয়ে চলুন, আগামীকাল আরো ভালো করতে পারবেন! 💪`;
    emoji = '🔥';
    mood = 'disappointed';
  } else if (percentage < 70) {
    message = `ভালো কাজ করেছেন! আপনি ${percentage}% কাজ সম্পন্ন করেছেন। এটা একটি মধ্যম হার। আরো কিছুটা চেষ্টা করলে সেরা ফলাফল পাবেন। চালিয়ে যান! 👍`;
    emoji = '👍';
    mood = 'neutral';
  } else if (percentage < 90) {
    message = `দারুণ! আপনি ${percentage}% কাজ সম্পন্ন করেছেন! এটা সত্যিই ভালো একটি হার। আপনি খুব ভালো কাজ করছেন। শুধু একটু আরো বাকি! চালিয়ে যান! 🌟`;
    emoji = '🌟';
    mood = 'good';
  } else {
    message = `অসাধারণ! আপনি ${percentage}% কাজ সম্পন্ন করেছেন! 🎉 আপনি আজকে দারুণ কাজ করেছেন! এই গতিই ধরে রাখুন। আপনি সত্যিই অসাধারণ! অভিনন্দন! 🏆✨`;
    emoji = '🎉';
    mood = 'excellent';
  }

  const weekStart = new Date(targetDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weeklyStats = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const wTasks = await tasks.find({ user_id: req.userId, date: dateStr });
    const dayTotal = wTasks.length;
    const dayCompleted = wTasks.filter(t => t.completed === true).length;
    weeklyStats.push({
      date: dateStr,
      day: banglaDays[d.getDay()],
      total: dayTotal,
      completed: dayCompleted,
      percentage: dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0
    });
  }

  res.json({ date: targetDate, day: dayName, totalTasks, completedTasks, percentage, message, emoji, mood, weeklyStats });
});

// Stats Route
app.get('/api/stats', authMiddleware, async (req, res) => {
  const allTasks = await tasks.find({ user_id: req.userId });
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed === true).length;
  const noteList = await notes.find({ user_id: req.userId });
  const totalNotes = noteList.length;
  const uniqueDates = [...new Set(allTasks.map(t => t.date))];
  const totalDays = uniqueDates.length;
  res.json({ totalTasks, completedTasks, totalNotes, totalDays });
});

app.listen(PORT, () => {
  console.log(`সার্ভার চলছে পোর্ট ${PORT} তে`);
});
