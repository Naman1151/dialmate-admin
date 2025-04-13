import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['missed', 'completed', 'ongoing'], default: 'ongoing' },
  callType: { type: String, enum: ['incoming', 'outgoing'] },
  duration: Number, // in seconds
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Call', callSchema);