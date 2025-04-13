import logActivity from '../utils/logActivity.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = [
      { id: 1, name: 'Front Desk', contact: '1234567890' },
      { id: 2, name: 'Housekeeping', contact: '0987654321' },
    ];
    logActivity('Admin', 'Fetched departments');
    res.status(200).json({ message: 'Departments fetched successfully', departments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
};

export const createDepartment = async (req, res) => {
  const { name, contact } = req.body;
  try {
    logActivity('Admin', `Created department ${name}`);
    res.status(201).json({
      message: 'Department created successfully!',
      data: { name, contact },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error });
  }
};