import { Router, Request, Response } from 'express';
import { query } from '../utils/db';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, verifyToken, extractToken, TokenPayload } from '../utils/jwt';
import { encryptToken, decryptToken } from '../utils/encryption';
import {
  SignupRequest,
  LoginRequest,
  AddCredentialRequest,
  AuthResponse,
  UserProfile,
} from '../utils/auth-types';

const router = Router();

/**
 * Middleware: Verify JWT token
 */
export async function authMiddleware(req: Request, res: Response, next: Function) {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization token',
      });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    (req as any).user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * POST /auth/signup
 * Register a new user
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as SignupRequest;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing username, email, or password',
      });
    }

    // Check if user already exists
    const existing = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists',
      });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      } as UserProfile,
    } as AuthResponse);
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Signup failed',
    });
  }
});

/**
 * POST /auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing username or password',
      });
    }

    // Find user
    const result = await query(
      'SELECT id, username, email, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      } as UserProfile,
    } as AuthResponse);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

/**
 * POST /auth/add-credential
 * Add or update SM platform credential (requires JWT)
 * Called when user drops SM icon in whale mouth
 */
router.post('/add-credential', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { platform, handle, token } = req.body as AddCredentialRequest;

    if (!platform || !handle || !token) {
      return res.status(400).json({
        success: false,
        error: 'Missing platform, handle, or token',
      });
    }

    if (!['bluesky', 'mastodon'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Platform must be bluesky or mastodon',
      });
    }

    // Encrypt the token before storage
    const encryptedToken = encryptToken(token);

    // Insert or update credential
    const result = await query(
      `INSERT INTO credentials (user_id, platform, handle, token_encrypted)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, platform) 
       DO UPDATE SET handle = $3, token_encrypted = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING id, platform, handle, created_at`,
      [user.userId, platform, handle, encryptedToken]
    );

    const credential = result.rows[0];

    res.json({
      success: true,
      credential: {
        id: credential.id,
        platform: credential.platform,
        handle: credential.handle,
        created_at: credential.created_at,
      },
    });
  } catch (error: any) {
    console.error('Add credential error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add credential',
    });
  }
});

/**
 * GET /auth/credentials
 * Get user's connected SM platform credentials (requires JWT)
 */
router.get('/credentials', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as TokenPayload;

    const result = await query(
      'SELECT id, platform, handle, created_at FROM credentials WHERE user_id = $1 ORDER BY created_at DESC',
      [user.userId]
    );

    const credentials = result.rows.map(c => ({
      id: c.id,
      platform: c.platform,
      handle: c.handle,
      created_at: c.created_at,
    }));

    res.json({
      success: true,
      credentials,
    });
  } catch (error: any) {
    console.error('Get credentials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credentials',
    });
  }
});

export default router;
