import express from 'express';
import { createCall, getCalls } from '../controllers/call.controller.js';

const router = express.Router();

router.post('/', createCall);
router.get('/', getCalls);

export default router;