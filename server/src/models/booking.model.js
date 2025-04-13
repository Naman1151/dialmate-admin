import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  bookingType: { type: String, enum: ['restaurant', 'spa'] },
  date: Date,
  timeSlot: String,
  status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'pending' },
  notes: String,
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);