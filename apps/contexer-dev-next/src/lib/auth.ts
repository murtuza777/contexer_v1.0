import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || 'fallback-refresh-secret'

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role?: string
  createdAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

// JWT token utilities
export const createTokens = (user: User): AuthTokens => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      username: user.username,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    REFRESH_JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid access token')
  }
}

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// Auth middleware
export const authenticateRequest = (request: NextRequest): User | null => {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    
    return {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
      createdAt: new Date()
    }
  } catch (error) {
    return null
  }
}

// Response helpers
export const createAuthResponse = (user: User, tokens: AuthTokens) => {
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role
    },
    ...tokens
  })
}

export const createErrorResponse = (message: string, status: number = 400) => {
  return NextResponse.json({ error: message }, { status })
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    }
  }

  return { isValid: true }
}

export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' }
  }
  
  if (username.length > 20) {
    return { isValid: false, message: 'Username must be no more than 20 characters long' }
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { 
      isValid: false, 
      message: 'Username can only contain letters, numbers, underscores, and hyphens' 
    }
  }

  return { isValid: true }
}
