"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Loader2 } from "lucide-react"

import LoadingButton from "@/components/ui/LoadingButton";

export default function LoginPage({ onBack, onSignup }: { onBack: () => void; onSignup: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithGoogle, signInAsGuest } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const { data, error } = await signIn(email, password)
    
    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during login')
    } else {
      // Login successful - redirect or update UI
      console.log("Login successful:", data)
      onBack() // Go back to landing page for now
    }
    
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    
    const { data, error } = await signInWithGoogle()
    
    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during Google sign in')
      setIsGoogleLoading(false)
    }
    // If successful, the user will be redirected by Google OAuth flow
  }

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true)
    setError(null)
    
    const { data, error } = await signInAsGuest()
    
    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during guest login')
    } else {
      // Guest login successful - redirect to dashboard
      console.log("Guest login successful:", data)
      onBack() // Go back to landing page for now
    }
    
    setIsGuestLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rotate-45 animate-float-slow hover:scale-150 transition-transform duration-300" />
        <div className="absolute bottom-20 right-20 w-6 h-6 bg-white/20 rounded-full animate-float-medium hover:scale-125 transition-transform duration-300" />
      </div>

      <Card className="w-full max-w-md bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-xl border-white/20 animate-fade-in-up shadow-2xl shadow-blue-500/10 relative overflow-hidden hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center mb-6 group">
            <div className="relative">
              <Code2 className="h-10 w-10 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white drop-shadow-lg">Contexer</span>
          </div>
          <CardTitle className="text-3xl text-white font-bold mb-2 drop-shadow-md">Welcome Back</CardTitle>
          <CardDescription className="text-white font-medium text-lg drop-shadow-sm">
            Sign in to continue building
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-white drop-shadow-sm">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:scale-105 active:scale-95 font-medium shadow-lg"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white drop-shadow-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15 hover:scale-105 active:scale-95 font-medium shadow-lg"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 text-gray-400 hover:text-white transition-colors duration-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 text-lg border-0 shadow-xl hover:shadow-blue-500/25"
            >
              Sign In
            </LoadingButton>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-white font-medium">OR</span>
            </div>
          </div>

          <div className="space-y-4">
            <LoadingButton
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              variant="outline"
              className="w-full bg-white/10 border-white/30 text-white font-semibold hover:bg-white/20 backdrop-blur-sm"
            >
              Sign in with Google
            </LoadingButton>
            <LoadingButton
              onClick={handleGuestSignIn}
              isLoading={isGuestLoading}
              variant="outline"
              className="w-full bg-white/10 border-white/30 text-white font-semibold hover:bg-white/20 backdrop-blur-sm"
            >
              Continue as Guest
            </LoadingButton>
          </div>

          <p className="mt-8 text-center text-sm text-white font-medium">
            Don't have an account?{" "}
            <button onClick={onSignup} className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-300">
              Sign up
            </button>
          </p>
          <button onClick={onBack} className="mt-4 w-full text-center text-sm text-white font-medium hover:text-blue-300 transition-colors duration-300">
            &larr; Back to Home
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
