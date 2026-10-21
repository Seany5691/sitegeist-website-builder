import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Verify user is authenticated
 * Returns session if valid, error response if not
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please log in.' },
      { status: 401 }
    )
  }
  
  return session
}

/**
 * Validate request origin to prevent CSRF
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  // Allow same-origin requests
  if (origin && host) {
    try {
      const originUrl = new URL(origin)
      return originUrl.host === host
    } catch {
      return false
    }
  }
  
  // Allow requests without origin header (same-origin)
  return !origin
}

/**
 * Combined middleware: auth + origin validation
 */
export async function protectRoute(request: NextRequest) {
  // Check origin
  if (!validateOrigin(request)) {
    return NextResponse.json(
      { success: false, message: 'Invalid origin' },
      { status: 403 }
    )
  }
  
  // Check authentication
  const sessionOrError = await requireAuth(request)
  
  // If it's a response (error), return it
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError
  }
  
  // Otherwise it's a valid session
  return sessionOrError
}
