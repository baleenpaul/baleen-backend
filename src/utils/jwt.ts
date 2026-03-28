import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'baleen-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
}

/**
 * Generate JWT token for a user
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
    });
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
