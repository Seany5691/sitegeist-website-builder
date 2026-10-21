// Simple in-memory rate limiter for login attempts
// In production, consider using Redis for distributed systems

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export class RateLimiter {
  private maxAttempts: number
  private windowMs: number
  
  constructor(maxAttempts: number = 5, windowMinutes: number = 15) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMinutes * 60 * 1000
  }
  
  /**
   * Check if request is rate limited
   * @param identifier - IP address or username
   * @returns true if rate limited, false if allowed
   */
  check(identifier: string): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)
    
    // No entry or window expired - allow
    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs
      })
      return false
    }
    
    // Increment count
    entry.count++
    
    // Check if exceeded
    if (entry.count > this.maxAttempts) {
      return true // Rate limited
    }
    
    return false // Still allowed
  }
  
  /**
   * Get remaining attempts
   */
  remaining(identifier: string): number {
    const entry = rateLimitStore.get(identifier)
    if (!entry || Date.now() > entry.resetAt) {
      return this.maxAttempts
    }
    return Math.max(0, this.maxAttempts - entry.count)
  }
  
  /**
   * Clear rate limit for identifier (use after successful login)
   */
  clear(identifier: string): void {
    rateLimitStore.delete(identifier)
  }
  
  /**
   * Cleanup expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Singleton instance
export const loginRateLimiter = new RateLimiter(5, 15) // 5 attempts per 15 minutes

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => loginRateLimiter.cleanup(), 5 * 60 * 1000)
}
