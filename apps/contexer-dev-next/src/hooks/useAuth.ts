import { useState } from "react"
import useUserStore from "@/stores/userSlice"

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
  const { user, login } = useUserStore()
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      // For now, simulate auth - replace with real auth later
      await new Promise(r => setTimeout(r, 300))
      const mockUser = { id: "demo", email, username: email.split("@")[0] }
      login(mockUser as any, "demo-token")
      return { data: { user: mockUser }, error: null }
    } catch (error) {
      return { data: null, error: "Authentication failed" }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      // For now, simulate auth - replace with real auth later
      await new Promise(r => setTimeout(r, 300))
      const mockUser = { id: "demo", email, username: name || email.split("@")[0] }
      login(mockUser as any, "demo-token")
      return { data: { user: mockUser }, error: null }
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
      await new Promise(r => setTimeout(r, 300))
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
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInAsGuest,
  }
}
