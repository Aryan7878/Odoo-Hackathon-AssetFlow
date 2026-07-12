import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { asyncWrapper } from '../utils/asyncWrapper';
import { authRateLimiter } from '../middlewares/rateLimiter';
import passport from '../config/passport';
import { signAccessToken, signRefreshToken } from '../config/jwt';
import { userRepository } from '../repositories/user.repository';
import { env } from '../config/env';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [ADMIN, ASSET_MANAGER, EMPLOYEE] }
 *               departmentId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 */
router.post('/register', authRateLimiter, asyncWrapper(authController.register.bind(authController)));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: admin@assetflow.com }
 *               password: { type: string, example: Password@123 }
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authRateLimiter, asyncWrapper(authController.login.bind(authController)));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', asyncWrapper(authController.refreshToken.bind(authController)));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticate, asyncWrapper(authController.logout.bind(authController)));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, asyncWrapper(authController.getCurrentUser.bind(authController)));
router.get('/users', authenticate, asyncWrapper(authController.findAllUsers.bind(authController)));

// =============================================
// Google OAuth Routes
// =============================================

router.get('/google', (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID) {
    res.status(501).json({ success: false, message: 'Google authentication is not configured on this server.' });
    return;
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err: Error | null, result: any) => {
      if (err || !result) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=google_auth_failed`);
      }

      if (result.requiresApproval) {
        // New Google user, awaiting approval
        return res.redirect(`${env.FRONTEND_URL}/pending-approval?email=${encodeURIComponent(result.user.email)}`);
      }

      // Existing active user – issue tokens and redirect to dashboard
      try {
        const accessToken = result.accessToken || signAccessToken({ userId: result.user.id, email: result.user.email, role: result.user.role });
        const refreshToken = result.refreshToken || signRefreshToken({ userId: result.user.id });
        if (!result.accessToken) {
          await userRepository.updateRefreshToken(result.user.id, refreshToken);
        }
        return res.redirect(`${env.FRONTEND_URL}/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
      } catch (e) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=token_error`);
      }
    })(req, res, next);
  }
);

export default router;
