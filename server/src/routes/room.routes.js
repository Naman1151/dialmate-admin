import express from 'express';
import { createRoom, getRooms, assignRoom, unassignRoom, getAvailableRooms, getUsersWithoutRooms } from '../controllers/room.controller.js';
import { validateCreateRoom, validateAssignRoom } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', validateCreateRoom, createRoom); // ✅ Create Room
router.get('/', getRooms); // ✅ Get All Rooms
router.post('/assign', validateAssignRoom, assignRoom); // ✅ Assign Room
router.post('/unassign', unassignRoom); // ✅ Unassign Room
router.get('/available', getAvailableRooms); // ✅ Get Available Rooms
router.get('/users-without-rooms', getUsersWithoutRooms); // ✅ Get Users Without Rooms

export default router;