import logActivity from '../utils/logActivity.js';

export const getCalls = async (req, res) => {
  try {
    const calls = [
      { id: 1, userType: 'Customer', callTime: '10:00 AM', status: 'Completed' },
      { id: 2, userType: 'Manager', callTime: '11:00 AM', status: 'Missed' },
    ];
    logActivity('Admin', 'Fetched calls');
    res.status(200).json({ message: 'Calls fetched successfully', calls });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calls', error });
  }
};

export const createCall = async (req, res) => {
  const { userType, callTime, status } = req.body;
  try {
    logActivity(userType, `Created call at ${callTime} with status ${status}`);
    res.status(201).json({
      message: 'Call created successfully!',
      data: { userType, callTime, status },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating call', error });
  }
};