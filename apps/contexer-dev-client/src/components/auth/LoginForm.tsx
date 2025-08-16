import React, { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { ArrowRight, Users, Loader2, Eye, Github, Sparkles, Zap } from "lucide-react"
import { LoadingButton } from "../ui/LoadingButton"
import LogoMark from "../LogoMark"

interface LoginFormProps {
  onBack: () => void
  onSignup: () => void
  onGuestAccess: () => void
  isGuestLoading: boolean
}

export function LoginForm({ onBack, onSignup, onGuestAccess, isGuestLoading }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const { data, error } = await signIn(email, password)
    
    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during login')
    } else {
      console.log("Login successful:", data)
      onBack()
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move" />

      <div className="w-full max-w-md relative">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/10 p-8 relative overflow-hidden group hover:shadow-black/20 transition-all duration-500">
          {/* Subtle border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6 group/logo">
              <div className="relative">
                <LogoMark className="w-12 h-12 transition-transform duration-300 group-hover/logo:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Contexer
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-600 text-base">
              Sign in to your account to continue
            </p>
          </div>
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-white font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 hover:shadow-sm"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 hover:shadow-sm pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showPassword ? <Eye className="w-5 h-5 opacity-50" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
                Forgot password?
              </button>
            </div>

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-0"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Sign in to Contexer
              </span>
            </LoadingButton>
          </form>
          
          {/* Guest Access Option */}
          <div className="mt-6">
            <LoadingButton
              onClick={onGuestAccess}
              isLoading={isGuestLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              variant="outline"
            >
              <span className="flex items-center justify-center gap-2">
                {isGuestLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Signing in as guest...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Continue as guest
                  </>
                )}
              </span>
            </LoadingButton>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-slate-600">
              Don't have an account?{" "}
              <button
                onClick={onSignup}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
              >
                Sign up for free
              </button>
            </p>
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors duration-200 flex items-center justify-center mx-auto group"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to home
            </button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-slate-600 font-medium">AI-Powered</p>
          </div>
          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-slate-600 font-medium">Lightning Fast</p>
          </div>
          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-slate-600 font-medium">Collaborative</p>
          </div>
        </div>
      </div>
    </div>
  )
}
