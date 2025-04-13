import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  contacts: [{ type: String }],
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);