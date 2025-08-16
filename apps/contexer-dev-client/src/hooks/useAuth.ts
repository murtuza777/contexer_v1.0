import { useState } from "react"
import useUserStore from "../stores/userSlice"

export interface AuthUser {
  id: string
  email?: string
  username?: string
}

export interface AuthResponse {
  data: { user: AuthUser } | null
  error: string | null
}

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useUserStore()
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: data.error || 'Login failed' }
      }

      // Store user data and tokens
      login(data.user, data.accessToken)
      
      return { data: { user: data.user }, error: null }
    } catch (error) {
      return { data: null, error: "Authentication failed" }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username: name || email.split('@')[0] }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: data.error || 'Registration failed' }
      }

      // Store user data and tokens
      login(data.user, data.session?.access_token)
      
      return { data: { user: data.user }, error: null }
    } catch (error) {
      return { data: null, error: "Registration failed" }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    return { data: null, error: "Google sign-in not implemented yet" }
  }

  const signInAsGuest = async (): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const guestUser = { 
        id: `guest_${Date.now()}`, 
        email: "guest@contexer.dev", 
        username: "Guest User" 
      }
      login(guestUser as any, "guest-token")
      return { data: { user: guestUser }, error: null }
    } catch (error) {
      return { data: null, error: "Guest login failed" }
    } finally {
      setLoading(false)
    }
  }

  return {
    user: user ? { id: user.id, email: user.email, username: user.username } : null,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInAsGuest,
  }
}
