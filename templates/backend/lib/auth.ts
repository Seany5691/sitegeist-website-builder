import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { loginRateLimiter } from './rate-limiter'

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.DASHBOARD_USERNAME || 'admin'

// Decode Base64 hash (Vercel mangles $ symbols, so we encode it)
let ADMIN_PASSWORD_HASH = process.env.DASHBOARD_PASSWORD_HASH || ''
if (process.env.DASHBOARD_PASSWORD_HASH_BASE64) {
  try {
    ADMIN_PASSWORD_HASH = Buffer.from(process.env.DASHBOARD_PASSWORD_HASH_BASE64, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Failed to decode Base64 password hash:', error)
  }
}

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET

console.log('🔧 Auth config loaded:')
console.log('  Username:', ADMIN_USERNAME)
console.log('  Hash loaded:', ADMIN_PASSWORD_HASH ? 'yes' : 'no')
console.log('  Hash length:', ADMIN_PASSWORD_HASH?.length)
console.log('  NextAuth secret set:', !!NEXTAUTH_SECRET)

// Validate required environment variables
if (!NEXTAUTH_SECRET) {
  console.error('❌ CRITICAL: NEXTAUTH_SECRET environment variable not set!')
  console.error('   Add this to Vercel: Settings > Environment Variables')
}

if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH.length < 10) {
  console.error('❌ CRITICAL: DASHBOARD_PASSWORD_HASH environment variable not set or invalid!')
  console.error('   Hash set:', !!ADMIN_PASSWORD_HASH, 'length:', ADMIN_PASSWORD_HASH?.length || 0)
  console.error('   Add this to Vercel: Settings > Environment Variables')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Dashboard Login',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log('🔐 LOGIN ATTEMPT:')
        console.log('  Username provided:', credentials?.username ? '***' : 'none')
        console.log('  Password provided:', credentials?.password ? 'yes' : 'no')

        // CRITICAL: Check if environment variables are configured
        if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH.length < 10) {
          console.error('❌ CRITICAL: DASHBOARD_PASSWORD_HASH environment variable not set or invalid!')
          console.error('   This must be configured in Vercel dashboard under Settings > Environment Variables')
          throw new Error('Server configuration error. Contact administrator.')
        }

        if (!credentials?.username || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }
        
        // Get IP address for rate limiting
        const forwarded = req.headers?.['x-forwarded-for']
        const ip = typeof forwarded === 'string' 
          ? forwarded.split(',')[0] 
          : req.headers?.['x-real-ip'] || 'unknown'
        
        // Check rate limit (5 attempts per 15 minutes)
        if (loginRateLimiter.check(ip)) {
          const remaining = loginRateLimiter.remaining(ip)
          console.log('❌ Rate limited')
          throw new Error(`Too many login attempts. Try again in 15 minutes. (${remaining} attempts remaining)`)
        }

        // Verify username
        if (credentials.username !== ADMIN_USERNAME) {
          console.log('❌ Username mismatch')
          return null
        }
        console.log('✅ Username matches')

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH)
        console.log('  Password valid:', isValid)
        
        if (!isValid) {
          console.log('❌ Password invalid')
          return null
        }
        
        // Success - clear rate limit
        loginRateLimiter.clear(ip)
        console.log('✅ Login successful')

        return {
          id: '1',
          name: ADMIN_USERNAME,
          email: 'admin@dashboard.local'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/dashboard',
    error: '/dashboard',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
