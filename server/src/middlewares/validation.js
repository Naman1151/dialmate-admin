import { body, param, validationResult } from 'express-validator';

// 🧩 Reusable function to handle errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 🧩 Auth Validations
export const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').notEmpty().withMessage('Role is required'),
  validateRequest
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

// 🧩 Room Validations
export const validateCreateRoom = [
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  validateRequest
];

export const validateAssignRoom = [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  validateRequest
];

// 🧩 Booking Validations
export const validateCreateBooking = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('departmentId').notEmpty().withMessage('Department ID is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
  body('bookingType').notEmpty().withMessage('Booking type is required'),
  validateRequest
];