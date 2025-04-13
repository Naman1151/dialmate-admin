import User from '../models/user.model.js';
import Room from '../models/room.model.js';
import logActivity from '../utils/logActivity.js';

// ✅ Create Room
export const createRoom = async (req, res) => {
  const { roomNumber } = req.body;

  try {
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const newRoom = new Room({ roomNumber });
    await newRoom.save();

    res.status(201).json({
      message: 'Room created successfully',
      data: newRoom
    });

    logActivity('Admin', `Created room number ${roomNumber}`);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error });
  }
};

// ✅ Get All Rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({ data: rooms });

    logActivity('Admin', 'Fetched all rooms');
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error });
  }
};

// ✅ Assign Room
export const assignRoom = async (req, res) => {
  const { customerId, roomNumber } = req.body;

  try {
    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (user.roomNumber) {
      return res.status(400).json({ message: `User already has room number ${user.roomNumber} assigned.` });
    }

    const room = await Room.findOne({ roomNumber });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status === 'occupied') {
      return res.status(400).json({ message: 'Room is already occupied' });
    }

    user.roomNumber = roomNumber;
    await user.save();

    room.assignedUser = user._id;
    room.status = 'occupied';
    await room.save();

    res.status(200).json({
      message: `Room ${roomNumber} assigned successfully to ${user.email}`,
      data: { customerId, roomNumber }
    });

    logActivity(user.email, `Assigned room ${roomNumber}`);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning room', error });
  }
};

// ✅ Unassign Room
export const unassignRoom = async (req, res) => {
  const { customerId } = req.body;

  try {
    const user = await User.findById(customerId);
    if (!user || !user.roomNumber) {
      return res.status(404).json({ message: 'User not found or no room assigned' });
    }

    const room = await Room.findOne({ roomNumber: user.roomNumber });
    if (room) {
      room.assignedUser = null;
      room.status = 'available';
      await room.save();
    }

    const previousRoom = user.roomNumber;
    user.roomNumber = null;
    await user.save();

    res.status(200).json({ message: `Room unassigned successfully from ${user.email}` });

    logActivity(user.email, `Unassigned from room ${previousRoom}`);
  } catch (error) {
    res.status(500).json({ message: 'Error unassigning room', error });
  }
};

// ✅ Get Available Rooms
export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'available' });
    res.status(200).json({ data: rooms });
    logActivity('Admin', 'Fetched available rooms');
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rooms', error });
  }
};

// ✅ Get Users Without Rooms
export const getUsersWithoutRooms = async (req, res) => {
  try {
    const users = await User.find({ roomNumber: null });
    res.status(200).json({ data: users });
    logActivity('Admin', 'Fetched users without rooms');
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users without rooms', error });
  }
};