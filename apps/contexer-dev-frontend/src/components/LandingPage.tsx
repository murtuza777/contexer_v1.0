import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "../hooks/useAuth"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { LoginForm } from "./auth/LoginForm"
import { SignupForm } from "./auth/SignupForm"
import { LoadingButton } from "./ui/LoadingButton"
import {
  Code2,
  Play,
  Bug,
  Terminal,
  Rocket,
  Save,
  ArrowRight,
  Check,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
  Sparkles,
  Zap,
  Star,
  ChevronDown,
  Users,
  Clock,
  Loader2,
  Bot,
  FileText,
  Eye,
} from "lucide-react"
import LogoMark from "@/components/LogoMark"

// Skeleton Components
const SkeletonCard = () => (
  <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20 relative overflow-hidden shadow-lg animate-pulse">
    <CardHeader className="text-center pb-4">
      <div className="w-16 h-16 bg-white/20 rounded-xl mx-auto mb-4 animate-pulse" />
      <div className="h-6 bg-white/20 rounded-lg mb-2 animate-pulse" />
      <div className="h-4 bg-white/15 rounded-lg w-24 mx-auto animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-white/15 rounded animate-pulse" />
        <div className="h-4 bg-white/15 rounded w-3/4 animate-pulse" />
      </div>
    </CardContent>
  </Card>
)

const SkeletonPricingCard = () => (
  <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20 relative overflow-hidden shadow-lg animate-pulse">
    <CardHeader className="text-center pb-8">
      <div className="h-8 bg-white/20 rounded-lg mb-2 animate-pulse" />
      <div className="h-12 bg-white/20 rounded-lg mb-2 animate-pulse" />
      <div className="h-4 bg-white/15 rounded-lg w-32 mx-auto animate-pulse" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="w-4 h-4 bg-white/20 rounded-full mr-3 animate-pulse" />
          <div className="h-4 bg-white/15 rounded flex-1 animate-pulse" />
        </div>
      ))}
      <div className="h-12 bg-white/20 rounded-lg mt-8 animate-pulse" />
    </CardContent>
  </Card>
)

const SkeletonStep = () => (
  <div className="text-center animate-pulse">
    <div className="relative mb-6 mx-auto w-fit">
      <div className="w-20 h-20 bg-white/20 rounded-full mx-auto animate-pulse" />
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full animate-pulse" />
    </div>
    <div className="h-6 bg-white/20 rounded-lg mb-4 animate-pulse" />
    <div className="space-y-2">
      <div className="h-4 bg-white/15 rounded animate-pulse" />
      <div className="h-4 bg-white/15 rounded w-3/4 mx-auto animate-pulse" />
      <div className="h-4 bg-white/15 rounded w-1/2 mx-auto animate-pulse" />
    </div>
  </div>
)

// Animated Counter Component
const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = "",
}: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible, isMounted])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

// Floating Action Button Component
const FloatingActionButton = ({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void
  children: React.ReactNode
  className?: string
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-4 rounded-full shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${className}`}
      style={{
        transform: isHovered ? "translateY(-4px) scale(1.1)" : "translateY(0) scale(1)",
      }}
    >
      <div className="relative">
        {children}
        {isHovered && <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />}
      </div>
    </button>
  )
}

interface LandingPageProps {
  onGuestAccess: () => void;
}

export default function LandingPage({ onGuestAccess }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup">("landing")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { signInAsGuest } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const [sectionsLoading, setSectionsLoading] = useState({
    hero: true,
    howItWorks: true,
    features: true,
    pricing: true,
  })
  const [isMounted, setIsMounted] = useState(false)

  // Track which sections are currently visible (for scroll-triggered animations)
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Stagger section loading
      setTimeout(() => setSectionsLoading((prev) => ({ ...prev, hero: false })), 200)
      setTimeout(() => setSectionsLoading((prev) => ({ ...prev, howItWorks: false })), 400)
      setTimeout(() => setSectionsLoading((prev) => ({ ...prev, features: false })), 600)
      setTimeout(() => setSectionsLoading((prev) => ({ ...prev, pricing: false })), 800)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouseMove)

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }))
        })
      },
      { threshold: 0.1 },
    )

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
      observerRef.current?.disconnect()
    }
  }, [isMounted])

  useEffect(() => {
    if (!isMounted) return
    
    const elements = document.querySelectorAll("[data-animate]")
    elements.forEach((el) => {
      if (el.id && observerRef.current) {
        observerRef.current.observe(el)
      }
    })
  }, [currentView, isMounted])

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true)
    
    const { data, error } = await signInAsGuest()
    
    if (error) {
      console.error("Guest login failed:", error)
    } else {
      console.log("Guest login successful:", data)
      onGuestAccess() // Call the callback to go to main app
    }
    
    setIsGuestLoading(false)
  }

  if (currentView === "login") {
    return <LoginForm onBack={() => setCurrentView("landing")} onSignup={() => setCurrentView("signup")} onGuestAccess={handleGuestSignIn} isGuestLoading={isGuestLoading} />
  }

  if (currentView === "signup") {
    return <SignupForm onBack={() => setCurrentView("landing")} onLogin={() => setCurrentView("login")} onGuestAccess={handleGuestSignIn} isGuestLoading={isGuestLoading} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-600 relative overflow-hidden">
      {/* Enhanced Mouse Follower with Micro-interactions */}
      <div
        className="fixed w-6 h-6 bg-blue-400/20 rounded-full pointer-events-none z-50 transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${scrollY > 100 ? 0.5 : 1})`,
        }}
      />
      <div
        className="fixed w-12 h-12 bg-blue-400/10 rounded-full pointer-events-none z-40 transition-all duration-500 ease-out"
        style={{
          left: mousePosition.x - 24,
          top: mousePosition.y - 24,
          transform: `scale(${scrollY > 100 ? 0.3 : 0.8})`,
        }}
      />

      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move" />

      {/* Enhanced Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rotate-45 animate-float-slow hover:scale-150 transition-transform duration-300" />
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/20 rounded-full animate-float-medium hover:scale-125 transition-transform duration-300" />
        <div className="absolute bottom-40 left-1/4 w-8 h-8 bg-blue-500/20 rotate-12 animate-float-fast hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-1/2 right-10 w-3 h-3 bg-white/30 animate-pulse-slow hover:scale-200 transition-transform duration-300" />
      </div>

      {/* Enhanced Navbar with Loading States */}
      <nav
        className={`border-b border-white/10 backdrop-blur-xl sticky top-0 z-40 transition-all duration-500 ${
          scrollY > 50
            ? "bg-slate-950/90 shadow-lg shadow-blue-500/10"
            : "bg-gradient-to-r from-slate-950/50 to-blue-950/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group cursor-pointer transform hover:scale-105 transition-all duration-300 active:scale-95">
              <LogoMark className="w-9 h-9" />
              <span className="ml-2 text-xl font-bold text-white drop-shadow-lg">Contexer</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {["How It Works", "Features", "Pricing"].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-white font-medium hover:text-blue-300 transition-all duration-300 hover:scale-105 active:scale-95 relative group py-2 drop-shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-white group-hover:w-full transition-all duration-500" />
                  <span className="absolute inset-0 bg-blue-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </a>
              ))}
              <LoadingButton
                onClick={() => setCurrentView("login")}
                className="text-white font-medium hover:text-blue-300 px-4 py-2 rounded-lg hover:bg-white/10 drop-shadow-sm bg-transparent border-0 shadow-none"
                variant="outline"
              >
                Login
              </LoadingButton>
              <LoadingButton
                onClick={() => setCurrentView("signup")}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold border-0 shadow-lg hover:shadow-blue-500/25 relative overflow-hidden group"
              >
                <span className="relative z-10">Start Building</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </LoadingButton>
            </div>

            <button
              className="md:hidden text-white hover:text-blue-400 transition-colors duration-300 hover:scale-110 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`h-6 w-6 absolute transition-all duration-300 ${
                    isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                />
                <X
                  className={`h-6 w-6 absolute transition-all duration-300 ${
                    isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-500 ease-out ${
            isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden bg-gradient-to-b from-slate-950/95 to-blue-950/95 backdrop-blur-xl`}
        >
          <div className="px-4 py-6 space-y-4">
            {["How It Works", "Features", "Pricing"].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-white font-medium hover:text-blue-300 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/10 transform hover:translate-x-2 active:scale-95"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <LoadingButton
              onClick={() => {
                setCurrentView("login")
                setIsMenuOpen(false)
              }}
              className="block w-full text-left text-white font-medium hover:text-blue-300 py-2 px-4 rounded-lg hover:bg-white/10 bg-transparent border-0 shadow-none"
              variant="outline"
            >
              Login
            </LoadingButton>
            <LoadingButton
              onClick={() => {
                setCurrentView("signup")
                setIsMenuOpen(false)
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300 font-semibold"
            >
              Start Building
            </LoadingButton>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section with Loading States */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative" id="hero" data-animate>
        <div className="max-w-7xl mx-auto text-center">
          {sectionsLoading.hero ? (
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-white/20 rounded-lg w-32 mx-auto" />
              <div className="space-y-4">
                <div className="h-16 bg-white/20 rounded-lg" />
                <div className="h-16 bg-white/20 rounded-lg w-3/4 mx-auto" />
              </div>
              <div className="h-6 bg-white/15 rounded-lg w-2/3 mx-auto" />
              <div className="flex justify-center gap-4">
                <div className="h-12 bg-white/20 rounded-lg w-32" />
                <div className="h-12 bg-white/20 rounded-lg w-32" />
              </div>
            </div>
          ) : (
            <>
              <div
                className={`transition-all duration-1000 ${
                  isVisible.hero ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                }`}
              >
                <Badge
                  variant="secondary"
                  className="mb-6 bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white border-blue-400/50 hover:scale-110 active:scale-95 transition-all duration-500 cursor-pointer group relative overflow-hidden font-semibold shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  <span className="relative z-10">🚀 Now in Beta</span>
                </Badge>
              </div>

              <div
                className={`transition-all duration-1000 delay-200 ${
                  isVisible.hero ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                }`}
              >
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-gradient-x drop-shadow-lg">
                    Tell it what to build.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent animate-gradient-x-reverse drop-shadow-lg">
                    Watch it build itself.
                  </span>
                </h1>
              </div>

              <div
                className={`transition-all duration-1000 delay-400 ${
                  isVisible.hero ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                }`}
              >
                <p className="text-xl text-white font-medium mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                  Your AI-powered coding assistant that builds full apps from just an idea. No more context switching,
                  no more prompt engineering. Just pure creation.
                </p>
              </div>

              <div
                className={`transition-all duration-1000 delay-600 ${
                  isVisible.hero ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                } flex flex-col sm:flex-row gap-4 justify-center items-center`}
              >
                <LoadingButton
                  size="lg"
                  onClick={() => setCurrentView("signup")}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold text-lg px-8 py-4 shadow-xl hover:shadow-blue-500/25 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Start Building
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </LoadingButton>
                
                <LoadingButton
                  variant="outline"
                  size="lg"
                  onClick={handleGuestSignIn}
                  isLoading={isGuestLoading}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 border-white/30 text-white font-semibold hover:from-purple-700/90 hover:to-indigo-700/90 backdrop-blur-sm group relative overflow-hidden shadow-lg"
                >
                  {isGuestLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Accessing...</span>
                    </div>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5 group-hover:scale-125 transition-transform duration-300" />
                      <span className="relative z-10">Continue as Guest</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </LoadingButton>
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:scale-125 transition-transform duration-300">
                <ChevronDown className="h-6 w-6 text-white/80" />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" data-animate className={`py-20 sm:py-32 transition-all duration-1000 ${isVisible['how-it-works'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/30 to-slate-950/30 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["how-it-works"] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white drop-shadow-lg">How It Works</h2>
            <p className="text-xl text-white font-medium max-w-2xl mx-auto drop-shadow-md">
              From idea to deployed app in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sectionsLoading.howItWorks
              ? [...Array(3)].map((_, index) => <SkeletonStep key={index} />)
              : [
                  {
                    step: 1,
                    title: "Describe Your Project",
                    description:
                      "Simply tell us what you want to build. Our AI understands natural language and translates your ideas into actionable development plans.",
                    icon: <Zap className="h-8 w-8" />,
                    gradient: "from-blue-500 to-blue-700",
                  },
                  {
                    step: 2,
                    title: "Watch AI Build in Real-Time",
                    description:
                      "See your app come to life as our AI writes code, fixes bugs, and implements features automatically. No manual intervention needed.",
                    icon: <Code2 className="h-8 w-8" />,
                    gradient: "from-white to-blue-200",
                  },
                  {
                    step: 3,
                    title: "Export or Deploy",
                    description:
                      "Download your complete project or deploy it instantly to the cloud. Your app is ready to share with the world.",
                    icon: <Rocket className="h-8 w-8" />,
                    gradient: "from-blue-400 to-white",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`text-center group transition-all duration-1000 delay-${index * 200} hover:scale-105 active:scale-95 cursor-pointer ${
                      isVisible["how-it-works"] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                    }`}
                  >
                    <div className="relative mb-6 mx-auto w-fit">
                      <div
                        className={`bg-gradient-to-br ${item.gradient} rounded-full w-20 h-20 flex items-center justify-center mx-auto border border-white/20 group-hover:scale-125 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/25 relative overflow-hidden shadow-lg`}
                      >
                        <div className="text-white group-hover:scale-110 transition-transform duration-300 relative z-10">
                          {item.icon}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-white rounded-full flex items-center justify-center text-sm font-bold text-slate-900 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300 drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-white font-medium group-hover:text-blue-100 transition-colors duration-300 leading-relaxed drop-shadow-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" data-animate className={`py-20 sm:py-32 bg-white/5 transition-all duration-1000 ${isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible.features ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white drop-shadow-lg">Powerful Features</h2>
            <p className="text-xl text-white font-medium max-w-2xl mx-auto drop-shadow-md">
              Everything you need to build, debug, and deploy your applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectionsLoading.features
              ? [...Array(4)].map((_, index) => <SkeletonCard key={index} />)
              : [
                  {
                    icon: <Bot className="h-12 w-12" />,
                    title: "Viber AI Agent",
                    description: "Intelligent AI development agent that visually observes, understands, and builds applications autonomously",
                    gradient: "from-blue-500 to-cyan-500",
                    stats: "AI-Powered",
                  },
                  {
                    icon: <FileText className="h-12 w-12" />,
                    title: "Context Composer",
                    description: "Smart context definition tool that helps you compose and manage project requirements and specifications",
                    gradient: "from-green-500 to-emerald-500",
                    stats: "Context-Aware",
                  },
                  {
                    icon: <Eye className="h-12 w-12" />,
                    title: "Visual Observer",
                    description: "Real-time visual monitoring system that observes your application interface and provides intelligent feedback",
                    gradient: "from-purple-500 to-violet-500",
                    stats: "Live Monitoring",
                  },
                  {
                    icon: <Bug className="h-12 w-12" />,
                    title: "Error Fixer",
                    description: "Automated error detection and resolution system that identifies and fixes issues as they occur",
                    gradient: "from-red-500 to-pink-500",
                    stats: "Auto-Fix",
                  },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 hover:-translate-y-2 active:scale-95 group relative overflow-hidden shadow-lg cursor-pointer ${
                      isVisible.features ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="text-center pb-4 relative z-10">
                      <div
                        className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg`}
                      >
                        <div className="font-sans text-white bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">{feature.icon}</div>
                      </div>
                      <CardTitle className="text-lg text-black font-bold group-hover:text-blue-700 transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/30 text-white border-blue-400/50 text-xs mt-2 font-semibold shadow-sm hover:scale-110 transition-transform duration-300"
                      >
                        {feature.stats}
                      </Badge>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-center text-slate-700 font-medium group-hover:text-slate-800 transition-colors duration-300 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" data-animate className={`py-20 sm:py-32 transition-all duration-1000 ${isVisible['pricing'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/30 to-slate-950/30 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible.pricing ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white drop-shadow-lg">Simple Pricing</h2>
            <p className="text-xl text-white font-medium max-w-2xl mx-auto drop-shadow-md">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {sectionsLoading.pricing ? (
              [...Array(2)].map((_, index) => <SkeletonPricingCard key={index} />)
            ) : (
              <>
                <Card
                  className={`bg-white/95 backdrop-blur-xl border-white/60 hover:border-blue-200 transition-all duration-500 hover:scale-105 hover:-translate-y-2 active:scale-95 group relative overflow-hidden shadow-xl cursor-pointer ${
                    isVisible.pricing ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                  }`}
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="text-center pb-8 relative z-10">
                    <CardTitle className="text-2xl mb-2 text-black font-bold group-hover:text-blue-700 transition-colors duration-300">
                      Free
                    </CardTitle>
                    <div className="text-5xl font-bold mb-2 text-black">$0</div>
                    <CardDescription className="text-slate-700 font-medium">
                      Perfect for trying out Contexer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    {[
                      { feature: "3 projects per month", icon: <Users className="h-4 w-4" /> },
                      { feature: "Basic AI assistance", icon: <Zap className="h-4 w-4" /> },
                      { feature: "Community support", icon: <Users className="h-4 w-4" /> },
                      { feature: "Export to GitHub", icon: <Github className="h-4 w-4" /> },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center group/item hover:scale-105 transition-transform duration-300"
                      >
                        <div className="bg-green-500/30 p-1 rounded-full mr-3 group-hover/item:scale-110 transition-transform duration-300 shadow-sm">
                          <Check className="h-3 w-3 text-green-300" />
                        </div>
                        <span className="text-slate-800 font-medium group-hover/item:text-blue-800 transition-colors duration-300">
                          {item.feature}
                        </span>
                      </div>
                    ))}
                    <LoadingButton
                      onClick={() => setCurrentView("signup")}
                      className="w-full mt-8 bg-white text-blue-700 font-semibold border-blue-200 hover:bg-blue-50 hover:border-blue-300 group/btn relative overflow-hidden shadow-lg"
                      variant="outline"
                    >
                      <span className="relative z-10">Get Started Free</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    </LoadingButton>
                  </CardContent>
                </Card>

                <Card
                  className={`bg-gradient-to-br from-blue-600/30 to-blue-800/30 backdrop-blur-xl border-blue-400/50 hover:border-blue-300/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 active:scale-95 relative group overflow-hidden shadow-xl cursor-pointer ${
                    isVisible.pricing ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-10"
                  }`}
                  style={{ animationDelay: "400ms" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold border-0 shadow-lg animate-pulse hover:scale-110 transition-transform duration-300">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                  <CardHeader className="text-center pb-8 relative z-10">
                    <CardTitle className="text-2xl mb-2 text-black font-bold group-hover:text-blue-700 transition-colors duration-300">
                      Pro
                    </CardTitle>
                    <div className="text-5xl font-bold mb-2 text-black">$29</div>
                    <CardDescription className="text-slate-700 font-medium">
                      For serious builders and teams
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    {[
                      { feature: "Unlimited projects", icon: <Rocket className="h-4 w-4" /> },
                      { feature: "Advanced AI models", icon: <Zap className="h-4 w-4" /> },
                      { feature: "Priority support", icon: <Clock className="h-4 w-4" /> },
                      { feature: "One-click deployment", icon: <Rocket className="h-4 w-4" /> },
                      { feature: "Team collaboration", icon: <Users className="h-4 w-4" /> },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center group/item hover:scale-105 transition-transform duration-300"
                      >
                        <div className="bg-green-500/30 p-1 rounded-full mr-3 group-hover/item:scale-110 transition-transform duration-300 shadow-sm">
                          <Check className="h-3 w-3 text-green-300" />
                        </div>
                        <span className="text-slate-800 font-medium group-hover/item:text-blue-800 transition-colors duration-300">
                          {item.feature}
                        </span>
                      </div>
                    ))}
                    <LoadingButton
                      onClick={() => setCurrentView("signup")}
                      className="w-full mt-8 bg-blue-700 hover:bg-blue-800 text-white font-semibold border-0 shadow-xl hover:shadow-blue-500/25 group/btn relative overflow-hidden"
                    >
                      <span className="relative z-10">Start Pro Trial</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    </LoadingButton>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-black/80 to-blue-950/80 backdrop-blur-xl text-white py-12 border-t border-white/20 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4 group cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300">
                <LogoMark className="w-9 h-9" />
                <span className="ml-2 text-xl font-bold text-white drop-shadow-lg">Contexer</span>
              </div>
              <p className="text-white font-medium max-w-md leading-relaxed drop-shadow-sm">
                The AI-powered coding assistant that builds full applications from just an idea. Focus on what matters
                while we handle the code.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white drop-shadow-sm">Legal</h3>
              <ul className="space-y-3 text-white">
                {["Terms of Service", "Privacy Policy"].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-medium hover:text-blue-300 transition-all duration-300 hover:translate-x-2 hover:scale-105 active:scale-95 inline-block relative group drop-shadow-sm"
                    >
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white drop-shadow-sm">Connect</h3>
              <div className="flex space-x-4">
                {[
                  { icon: <Twitter className="h-6 w-6" />, href: "#", color: "hover:text-blue-400" },
                  { icon: <Github className="h-6 w-6" />, href: "#", color: "hover:text-gray-300" },
                  { icon: <Linkedin className="h-6 w-6" />, href: "#", color: "hover:text-blue-500" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`text-white ${social.color} transition-all duration-300 hover:scale-125 hover:-translate-y-1 active:scale-95 p-2 rounded-lg hover:bg-white/10 shadow-lg`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white font-medium drop-shadow-sm">
            <p>&copy; 2024 Contexer. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setCurrentView("signup")}>
        <Rocket className="h-6 w-6" />
      </FloatingActionButton>
    </div>
  )
}

