import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyPassword } from '@/lib/auth'

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH)

    if (isValid) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      })
      return response
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const isAuthenticated = request.cookies.get('admin-authenticated')?.value === 'true'
  
  return NextResponse.json({ authenticated: isAuthenticated })
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin-authenticated')
  return response
}
