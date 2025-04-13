import User from '../models/user.model.js';
import Room from '../models/room.model.js';
import logActivity from '../utils/logActivity.js';
import bcrypt from 'bcrypt';

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    logActivity('Admin', 'Fetched all users');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

// ✅ Get All Rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rooms', error: error.message });
  }
};

// ✅ Update User Status
export const updateUserStatus = async (req, res) => {
  const { userId, status } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = status;
    await user.save();

    logActivity('Admin', `Updated user ${user.email} status to ${status}`);

    res.status(200).json({ success: true, message: `User ${user.email} status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user status', error: error.message });
  }
};

// ✅ Update User Role
export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    logActivity('Admin', `Updated user ${user.email} role to ${role}`);

    res.status(200).json({ success: true, message: `User ${user.email} role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user role', error: error.message });
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logActivity('Admin', `Deleted user ${user.email}`);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};

// ✅ Create New User (🚀 Add User Modal)
export const createUser = async (req, res) => {
  const { name, email, phone, role, status, password } = req.body;

  try {
    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create and save user
    const newUser = new User({ name, email, phone, role, status, password: hashedPassword });
    await newUser.save();

    logActivity('Admin', `Created new user ${email}`);

    res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
};