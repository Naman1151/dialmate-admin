import express from 'express';
import { register, login, autoLogin } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validateRegister, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/auto-login/{token}:
 *   get:
 *     summary: Auto-login using token (URL-based)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Auto-login token
 *     responses:
 *       200:
 *         description: User auto-logged in successfully
 */
router.get('/auto-login/:token', autoLogin);

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     summary: Test auth route
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Test route working 🎉
 */
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route working 🎉' });
});

export default router;
