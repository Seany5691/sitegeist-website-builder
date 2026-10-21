import bcrypt from 'bcryptjs'

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a plain text password against a hashed password
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    if (!hashedPassword) {
      return false
    }
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
