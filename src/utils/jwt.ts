import jwt from 'jsonwebtoken';

// JWT secret key - use environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Define the JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

/**
 * Generate JWT token for a user
 * @param userId - The user's ID
 * @param email - The user's email
 * @param role - The user's role (user or admin)
 * @returns JWT token string
 */
export const generateToken = (
  userId: string,
  email: string,
  role: 'user' | 'admin'
): string => {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );
};

/**
 * Verify and decode JWT token
 * @param token - The JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - The Authorization header value
 * @returns Token string or null
 */
export const extractToken = (authHeader: string | null | undefined): string | null => {
  if (!authHeader) return null;

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
};
