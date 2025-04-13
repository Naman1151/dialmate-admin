// src/models/activity.model.js
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  action: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  details: Object,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Activity', activitySchema);