import logActivity from '../utils/logActivity.js';

export const getBookings = async (req, res) => {
  try {
    const bookings = [
      { id: 1, userId: 'User1', departmentId: 'Dept1', timeSlot: '10:00 AM', status: 'Confirmed' },
      { id: 2, userId: 'User2', departmentId: 'Dept2', timeSlot: '11:00 AM', status: 'Pending' },
    ];
    logActivity('Admin', 'Fetched bookings');
    res.status(200).json({ message: 'Bookings fetched successfully', bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

export const createBooking = async (req, res) => {
  const { userId, departmentId, timeSlot, bookingType } = req.body;
  try {
    logActivity(userId, `Created booking for department ${departmentId}`);
    res.status(201).json({
      message: 'Booking created successfully!',
      data: { userId, departmentId, timeSlot, bookingType },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  try {
    logActivity('Admin', `Updated booking ${bookingId} status to ${status}`);
    res.status(200).json({ message: `Booking ${bookingId} status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error });
  }
};