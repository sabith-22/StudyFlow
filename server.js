const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Loads MONGO_URI from .env

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// ✅ Import Models
const User = require('./models/User');

// ✅ New Schema for History
const historySchema = new mongoose.Schema({
  email: String,
  subject: String,
  topic: String,
  plan_md: String,
  generatedAt: { type: Date, default: Date.now }
});

const StudyHistory = mongoose.model('StudyHistory', historySchema, 'studyhistory');

// 🔐 Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🔑 Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({
      message: 'Login successful',
      username: user.username,
      email: user.email,
      userId: user._id,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📩 Generate Plan (calls AI server)
app.post('/api/generate-plan', async (req, res) => {
  try {
    const response = await fetch('http://localhost:6000/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ AI server error:', error.message);
    res.status(500).json({ message: 'Error generating study plan' });
  }
});

// 📌 Save Study Plan to History
app.post('/api/save-history', async (req, res) => {
  try {
    const { email, subject, topic, plan_md } = req.body;
    const newEntry = new StudyHistory({ email, subject, topic, plan_md });
    await newEntry.save();
    res.status(200).json({ message: "Study plan saved to history!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ DELETE /api/delete-history/:id
app.delete('/api/delete-history/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await StudyHistory.findByIdAndDelete(id);
    res.status(200).json({ message: "Plan deleted from history." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete plan", error: err.message });
  }
});


// 📚 Get History for a User
app.get('/api/history', async (req, res) => {
  const { email } = req.query;
  try {
    const history = await StudyHistory.find({ email }).sort({ generatedAt: -1 });
    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Delete Account Route
app.post('/api/delete-account', async (req, res) => {
  const { email } = req.body;

  try {
    const deleted = await User.deleteOne({ email });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`🗑️ User ${email} deleted.`);
    await StudyHistory.deleteMany({ email });
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// 🔚 Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
