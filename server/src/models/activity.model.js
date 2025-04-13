import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Optional: In case of system-level actions
  },
  action: { 
    type: String, 
    required: true 
  },
  details: { 
    type: String, 
    default: '' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);