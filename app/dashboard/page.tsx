"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Brain,
  Plus,
  BookOpen,
  Target,
  Star,
  Upload,
  Play,
  BarChart3,
  Calendar,
  Download,
  User,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    name: "Loading...",
    email: "loading@example.com",
    avatar: "",
    streak: 1,
    totalCards: 0,
    studiedToday: 0,
    isNewUser: true,
  })
  const [flashcardDecks, setFlashcardDecks] = useState([])

  useEffect(() => {
    console.log("[v0] Dashboard loading user data...")

    const userData = localStorage.getItem("currentUser")
    const isAuthenticated = localStorage.getItem("isAuthenticated")

    console.log("[v0] Authentication status:", isAuthenticated)
    console.log("[v0] User data from localStorage:", userData)

    if (!isAuthenticated) {
      console.log("[v0] Not authenticated, redirecting to login")
      router.push("/auth/login")
      return
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log("[v0] Parsed user data:", parsedUser)

        const existingDecks = JSON.parse(localStorage.getItem("flashcardDecks") || "[]")
        const totalCards = existingDecks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0)
        const isNewUser = parsedUser.isNewUser || totalCards === 0

        const updatedUser = {
          name: parsedUser.name || "User",
          email: parsedUser.email || "user@example.com",
          avatar: parsedUser.avatar || "",
          streak: isNewUser ? 1 : parsedUser.studyStreak || 1,
          totalCards: totalCards,
          studiedToday: isNewUser ? 0 : Math.floor(Math.random() * 15) + 5,
          isNewUser: isNewUser,
        }

        console.log("[v0] Setting user state:", updatedUser)
        setUser(updatedUser)
        setFlashcardDecks(existingDecks)
      } catch (error) {
        console.error("[v0] Error parsing user data:", error)
        // Fallback to default user
        setUser({
          name: "User",
          email: "user@example.com",
          avatar: "",
          streak: 1,
          totalCards: 0,
          studiedToday: 0,
          isNewUser: true,
        })
      }
    } else {
      console.log("[v0] No user data found in localStorage")
      // Check if there's saved profile data from previous sessions
      const savedProfile = localStorage.getItem("savedUserProfile")
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile)
          console.log("[v0] Found saved profile:", parsedProfile)
          setUser({
            name: parsedProfile.name || "User",
            email: parsedProfile.email || "user@example.com",
            avatar: parsedProfile.avatar || "",
            streak: 1,
            totalCards: 0,
            studiedToday: 0,
            isNewUser: true,
          })
        } catch (error) {
          console.error("[v0] Error parsing saved profile:", error)
        }
      }
    }
  }, [router])

  const handleLogout = () => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      localStorage.setItem(
        "savedUserProfile",
        JSON.stringify({
          name: parsedUser.name,
          email: parsedUser.email,
          avatar: parsedUser.avatar,
          provider: parsedUser.provider,
        }),
      )
    }

    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("currentUser")

    router.push("/auth/login")
  }

  const getRecentSessions = () => {
    if (flashcardDecks.length === 0) {
      return [{ deck: "Welcome to FlashGenius!", cards: 0, accuracy: 0, time: "Get started by uploading content" }]
    }

    return flashcardDecks.slice(0, 3).map((deck, index) => ({
      deck: deck.name,
      cards: Math.floor(Math.random() * 20) + 5,
      accuracy: Math.floor(Math.random() * 20) + 75,
      time: index === 0 ? "2 hours ago" : index === 1 ? "Yesterday" : "2 days ago",
    }))
  }

  const getStudyDecks = () => {
    if (flashcardDecks.length === 0) {
      return [{ name: "No decks yet", cards: 0, due: 0, difficulty: "Start by uploading content!" }]
    }

    return flashcardDecks.slice(0, 3).map((deck) => ({
      name: deck.name,
      cards: deck.totalCards || 0,
      due: Math.floor(Math.random() * 10) + 1,
      difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">FlashGenius</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">{user.streak} day streak</Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                      <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                    <Link href="/analytics">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {user.isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`}
            </h1>
            <p className="text-gray-300">
              {user.isNewUser
                ? "Let's get started with your first flashcard deck!"
                : "Ready to continue your learning journey?"}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Cards</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.totalCards}</div>
              <p className="text-xs text-gray-400">
                {user.isNewUser ? "Create your first deck!" : "+12 from last week"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Studied Today</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.studiedToday}</div>
              <p className="text-xs text-gray-400">Goal: 30 cards</p>
              <Progress value={user.isNewUser ? 0 : (user.studiedToday / 30) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Learning Streak</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {user.streak} day{user.streak !== 1 ? "s" : ""}
              </div>
              <p className="text-xs text-gray-400">{user.isNewUser ? "Start your journey!" : "Keep it up!"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Link href="/upload">
            <Button className="h-24 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center space-y-2 w-full">
              <Upload className="h-6 w-6" />
              <span>Upload Content</span>
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="h-24 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center space-y-2 w-full">
              <Plus className="h-6 w-6" />
              <span>Create Deck</span>
            </Button>
          </Link>
          <Link href="/study">
            <Button className="h-24 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center space-y-2 w-full">
              <Play className="h-6 w-6" />
              <span>Quick Study</span>
            </Button>
          </Link>
          <Link href="/study/spaced-repetition">
            <Button className="h-24 bg-indigo-600 hover:bg-indigo-700 text-white flex flex-col items-center justify-center space-y-2 w-full">
              <Calendar className="h-6 w-6" />
              <span>Spaced Review</span>
            </Button>
          </Link>
          <Link href="/export">
            <Button className="h-24 bg-cyan-600 hover:bg-cyan-700 text-white flex flex-col items-center justify-center space-y-2 w-full">
              <Download className="h-6 w-6" />
              <span>Export Decks</span>
            </Button>
          </Link>
          <Link href="/analytics">
            <Button className="h-24 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center justify-center space-y-2 w-full">
              <BarChart3 className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
          </Link>
        </div>

        {/* Recent Activity & Study Decks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Recent Study Sessions</CardTitle>
              <CardDescription className="text-gray-300">Your latest learning activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getRecentSessions().map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{session.deck}</div>
                    <div className="text-sm text-gray-400">
                      {session.cards > 0
                        ? `${session.cards} cards • ${session.accuracy}% accuracy`
                        : "Upload content to get started"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{session.time}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Study Decks</CardTitle>
              <CardDescription className="text-gray-300">Your flashcard collections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getStudyDecks().map((deck, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{deck.name}</div>
                    <div className="text-sm text-gray-400">
                      {deck.cards > 0 ? `${deck.cards} cards • ${deck.due} due` : ""}
                    </div>
                  </div>
                  {deck.cards > 0 && (
                    <Badge
                      className={`${
                        deck.difficulty === "Easy"
                          ? "bg-green-600/20 text-green-400 border-green-600/30"
                          : deck.difficulty === "Medium"
                            ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                            : "bg-red-600/20 text-red-400 border-red-600/30"
                      }`}
                    >
                      {deck.difficulty}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
