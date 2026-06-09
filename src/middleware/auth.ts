import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, JWTPayload } from '@/utils/jwt';

/**
 * Middleware to check if user is authenticated
 * Extracts and verifies JWT token from Authorization header
 * Adds user info to request headers for use in route handlers
 */
export async function authMiddleware(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Create response with user info
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-role', payload.role);

    return response;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Unauthorized: Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Middleware to check if user has admin role
 */
export async function adminMiddleware(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Create response with user info
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-role', payload.role);

    return response;
  } catch (error) {
    console.error('Admin middleware error:', error);
    return NextResponse.json(
      { error: 'Unauthorized: Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Helper function to get user from request headers (after middleware)
 */
export function getUserFromRequest(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id'),
    email: request.headers.get('x-user-email'),
    role: request.headers.get('x-user-role') as 'user' | 'admin' | null,
  };
}
