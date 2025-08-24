"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Loader2 } from "lucide-react"

import LoadingButton from "@/components/ui/LoadingButton";

export default function SignupPage({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data, error } = await signUp(email, password, name)

    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during sign up')
    } else {
      // Signup successful
      console.log("Signup successful:", data)
      onBack()
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rotate-45 animate-float-slow" />
        <div className="absolute bottom-20 right-20 w-6 h-6 bg-white/30 rounded-full animate-float-medium" />
      </div>

      <Card className="w-full max-w-md bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-xl border-white/20 animate-fade-in-up shadow-2xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center mb-6 group">
            <div className="relative">
              <Code2 className="h-10 w-10 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white drop-shadow-lg">Contexer</span>
          </div>
          <CardTitle className="text-3xl text-white font-bold mb-2 drop-shadow-md">Create an Account</CardTitle>
          <CardDescription className="text-white font-medium text-lg drop-shadow-sm">
            Start your journey with us
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
              <label htmlFor="name" className="block text-sm font-semibold text-white drop-shadow-sm">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/40 shadow-lg"
                placeholder="Enter your name"
              />
            </div>
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
                className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/40 shadow-lg"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white drop-shadow-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/40 shadow-lg"
                placeholder="Create a password"
              />
            </div>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 text-lg border-0 shadow-xl hover:shadow-blue-500/25"
            >
              Create Account
            </LoadingButton>
          </form>

          <p className="mt-8 text-center text-sm text-white font-medium">
            Already have an account?{" "}
            <button onClick={onLogin} className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-300">
              Sign in
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
