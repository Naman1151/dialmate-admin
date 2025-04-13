import express from 'express';
import { createDepartment, getDepartments } from '../controllers/department.controller.js';

const router = express.Router();

router.post('/', createDepartment);
router.get('/', getDepartments);

export default router;