const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  task: String,
  completed: Boolean
});

const PlanSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  createdAt: { type: Date, default: Date.now },
  tasks: [TaskSchema]
});

const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  plans: [PlanSchema]  // ⬅️ Add plans array
});

module.exports = mongoose.model('User', UserSchema);
