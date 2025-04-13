import fs from 'fs';
import path from 'path';
import Activity from '../models/activity.model.js';

// ✅ Log Activity Function
const logActivity = async (user, action, details = '') => {
  const logFile = path.join(process.cwd(), 'activity.log');
  const logEntry = `${new Date().toISOString()} | User: ${user} | Action: ${action} | Details: ${details}\n`;

  // ✅ Write to log file
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Error writing to activity.log:', err);
    }
  });

  // ✅ Also save to database (MongoDB)
  try {
    await Activity.create({
      user: null, // ✅ Optional: You can pass user _id if available
      action,
      details,
    });
  } catch (error) {
    console.error('Error logging activity to database:', error.message);
  }
};

export default logActivity;