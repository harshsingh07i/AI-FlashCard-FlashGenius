"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Brain, Mail, Lock, Github, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call with validation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const userData = {
        id: "1",
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        email: email,
        avatar: "",
        joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        studyStreak: 1, // New user starts with 1 day streak
        totalCards: 0, // New user starts with 0 cards
        accuracy: 0, // No accuracy until they study
        isNewUser: true,
      }

      // Store user data in localStorage (in real app, use proper session management)
      localStorage.setItem("currentUser", JSON.stringify(userData))
      localStorage.setItem("isAuthenticated", "true")

      router.push("/dashboard")
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const openOAuthPopup = (provider: string) => {
    const popup = window.open(
      `https://${provider}.com/oauth/authorize?client_id=demo&redirect_uri=${window.location.origin}/auth/callback`,
      `${provider}_oauth`,
      "width=500,height=600,scrollbars=yes,resizable=yes",
    )

    return popup
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    setError("")

    try {
      const popup = openOAuthPopup(provider)

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.")
      }

      // Simulate OAuth flow with popup
      await new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            resolve(true)
          }
        }, 1000)

        // Auto-close popup after 3 seconds to simulate successful auth
        setTimeout(() => {
          if (!popup.closed) {
            popup.close()
          }
          clearInterval(checkClosed)
          resolve(true)
        }, 3000)
      })

      let userData

      if (provider === "google") {
        const names = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson"]
        const randomName = names[Math.floor(Math.random() * names.length)]

        userData = {
          id: Math.random().toString(36).substr(2, 9),
          name: randomName,
          email: `${randomName.toLowerCase().replace(" ", ".")}@gmail.com`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=3b82f6&color=fff`,
          joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          studyStreak: 1,
          totalCards: 0,
          accuracy: 0,
          provider: provider,
          isNewUser: true,
        }
      } else {
        const names = ["Alex Chen", "Jordan Taylor", "Casey Morgan", "Riley Parker", "Avery Brooks"]
        const randomName = names[Math.floor(Math.random() * names.length)]

        userData = {
          id: Math.random().toString(36).substr(2, 9),
          name: randomName,
          email: `${randomName.toLowerCase().replace(" ", "")}@users.noreply.github.com`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=24292e&color=fff`,
          joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          studyStreak: 1,
          totalCards: 0,
          accuracy: 0,
          provider: provider,
          isNewUser: true,
        }
      }

      localStorage.setItem("currentUser", JSON.stringify(userData))
      localStorage.setItem("isAuthenticated", "true")

      router.push("/dashboard")
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">FlashGenius</span>
          </div>
          <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">Sign in to continue your learning journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("github")}
              disabled={isLoading}
              className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
