import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, unique: true },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['occupied', 'available'], default: 'available' },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);