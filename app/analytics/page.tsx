"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, ArrowLeft, Target, Clock, BookOpen, Star, Activity } from "lucide-react"

interface AnalyticsData {
  totalStudySessions: number
  totalTimeStudied: number
  averageAccuracy: number
  streakDays: number
  totalCards: number
  cardsStudiedToday: number
  weeklyProgress: number[]
  deckPerformance: Array<{
    name: string
    accuracy: number
    timeSpent: number
    cardsStudied: number
  }>
  recentSessions: Array<{
    date: string
    deck: string
    accuracy: number
    timeSpent: number
    cardsStudied: number
  }>
  spacedRepetitionStats: {
    box1: number
    box2: number
    box3: number
    box4: number
    box5: number
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadRealAnalytics = () => {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
      const flashcardDecks = JSON.parse(localStorage.getItem("flashcardDecks") || "[]")
      const studySessions = JSON.parse(localStorage.getItem("studySessions") || "[]")
      const spacedRepetitionData = JSON.parse(localStorage.getItem("spacedRepetitionData") || "{}")

      // Calculate real statistics
      const totalCards = flashcardDecks.reduce((sum: number, deck: any) => sum + (deck.cards?.length || 0), 0)
      const totalSessions = studySessions.length
      const totalTimeStudied = studySessions.reduce((sum: number, session: any) => sum + (session.timeSpent || 0), 0)
      const averageAccuracy =
        studySessions.length > 0
          ? Math.round(
              studySessions.reduce((sum: number, session: any) => sum + (session.accuracy || 0), 0) /
                studySessions.length,
            )
          : 0

      // Calculate streak (simplified - days with study activity)
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const hasStudiedToday = studySessions.some((session: any) => new Date(session.date).toDateString() === today)
      const hasStudiedYesterday = studySessions.some(
        (session: any) => new Date(session.date).toDateString() === yesterday,
      )
      const streakDays = hasStudiedToday ? (hasStudiedYesterday ? 2 : 1) : 0

      // Cards studied today
      const cardsStudiedToday = studySessions
        .filter((session: any) => new Date(session.date).toDateString() === today)
        .reduce((sum: number, session: any) => sum + (session.cardsStudied || 0), 0)

      // Weekly progress (last 7 days)
      const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 86400000).toDateString()
        const daySessions = studySessions.filter((session: any) => new Date(session.date).toDateString() === date)
        return daySessions.length > 0
          ? Math.round(
              daySessions.reduce((sum: number, session: any) => sum + (session.accuracy || 0), 0) / daySessions.length,
            )
          : 0
      })

      // Deck performance
      const deckPerformance = flashcardDecks
        .map((deck: any) => {
          const deckSessions = studySessions.filter((session: any) => session.deckId === deck.id)
          const totalTime = deckSessions.reduce((sum: number, session: any) => sum + (session.timeSpent || 0), 0)
          const totalCardsStudied = deckSessions.reduce(
            (sum: number, session: any) => sum + (session.cardsStudied || 0),
            0,
          )
          const avgAccuracy =
            deckSessions.length > 0
              ? Math.round(
                  deckSessions.reduce((sum: number, session: any) => sum + (session.accuracy || 0), 0) /
                    deckSessions.length,
                )
              : 0

          return {
            name: deck.name || "Untitled Deck",
            accuracy: avgAccuracy,
            timeSpent: totalTime,
            cardsStudied: totalCardsStudied,
          }
        })
        .filter((deck) => deck.cardsStudied > 0) // Only show decks that have been studied

      // Recent sessions (last 10)
      const recentSessions = studySessions
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map((session: any) => ({
          date: session.date,
          deck: flashcardDecks.find((deck: any) => deck.id === session.deckId)?.name || "Unknown Deck",
          accuracy: session.accuracy || 0,
          timeSpent: session.timeSpent || 0,
          cardsStudied: session.cardsStudied || 0,
        }))

      // Spaced repetition stats
      const spacedRepetitionStats = {
        box1: spacedRepetitionData.box1?.length || 0,
        box2: spacedRepetitionData.box2?.length || 0,
        box3: spacedRepetitionData.box3?.length || 0,
        box4: spacedRepetitionData.box4?.length || 0,
        box5: spacedRepetitionData.box5?.length || 0,
      }

      return {
        totalStudySessions: totalSessions,
        totalTimeStudied,
        averageAccuracy,
        streakDays,
        totalCards,
        cardsStudiedToday,
        weeklyProgress,
        deckPerformance,
        recentSessions,
        spacedRepetitionStats,
      }
    }

    setTimeout(() => setAnalyticsData(loadRealAnalytics()), 500)
  }, [])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">Loading your analytics...</p>
        </div>
      </div>
    )
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
            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="text-white hover:text-blue-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Learning Analytics</h1>
          <p className="text-gray-300 text-lg">Track your progress and optimize your study habits</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Study Sessions</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData.totalStudySessions}</div>
              <p className="text-xs text-gray-400">Total completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Time Studied</CardTitle>
              <Clock className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatTime(analyticsData.totalTimeStudied)}</div>
              <p className="text-xs text-gray-400">Total learning time</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Average Accuracy</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData.averageAccuracy}%</div>
              <p className="text-xs text-gray-400">Across all sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Current Streak</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData.streakDays} days</div>
              <p className="text-xs text-gray-400">Keep it going!</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="spaced-repetition" className="data-[state=active]:bg-blue-600">
              Spaced Repetition
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Weekly Progress</CardTitle>
                  <CardDescription className="text-gray-300">Your accuracy over the past 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.weeklyProgress.map((accuracy, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-12 text-sm text-gray-400">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                        </div>
                        <div className="flex-1">
                          <Progress value={accuracy} className="h-2" />
                        </div>
                        <div className="w-12 text-sm text-white text-right">{accuracy}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Progress */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Today's Progress</CardTitle>
                  <CardDescription className="text-gray-300">Your learning activity today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      <span className="text-white">Cards Studied</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{analyticsData.cardsStudiedToday}</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Daily Goal Progress</span>
                      <span className="text-white">{analyticsData.cardsStudiedToday}/30</span>
                    </div>
                    <Progress value={(analyticsData.cardsStudiedToday / 30) * 100} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">87%</div>
                      <div className="text-sm text-gray-400">Today's Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">45m</div>
                      <div className="text-sm text-gray-400">Time Studied</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Deck Performance</CardTitle>
                <CardDescription className="text-gray-300">
                  How you're performing across different decks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.deckPerformance.map((deck, index) => (
                    <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">{deck.name}</h3>
                        <Badge
                          className={`${
                            deck.accuracy >= 90
                              ? "bg-green-600/20 text-green-400 border-green-600/30"
                              : deck.accuracy >= 80
                                ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                                : "bg-red-600/20 text-red-400 border-red-600/30"
                          }`}
                        >
                          {deck.accuracy}% accuracy
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Time Spent</div>
                          <div className="text-white font-medium">{formatTime(deck.timeSpent)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Cards Studied</div>
                          <div className="text-white font-medium">{deck.cardsStudied}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Avg. per Card</div>
                          <div className="text-white font-medium">
                            {Math.round((deck.timeSpent / deck.cardsStudied) * 60)}s
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spaced-repetition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Leitner Box Distribution</CardTitle>
                  <CardDescription className="text-gray-300">Cards in each spaced repetition box</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analyticsData.spacedRepetitionStats).map(([box, count], index) => (
                    <div key={box} className="flex items-center space-x-4">
                      <div className="w-16 text-sm text-gray-400">Box {index + 1}</div>
                      <div className="flex-1">
                        <Progress value={(count / analyticsData.totalCards) * 100} className="h-3" />
                      </div>
                      <div className="w-12 text-sm text-white text-right">{count}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Learning Efficiency</CardTitle>
                  <CardDescription className="text-gray-300">
                    How effectively you're retaining information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">92%</div>
                    <div className="text-gray-300">Retention Rate</div>
                    <div className="text-sm text-gray-400 mt-1">Cards moving to higher boxes</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">8</div>
                      <div className="text-sm text-gray-400">Cards Due Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">23</div>
                      <div className="text-sm text-gray-400">Cards Due This Week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Study Sessions</CardTitle>
                <CardDescription className="text-gray-300">Your latest learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.recentSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <div className="text-white font-medium">{session.deck}</div>
                          <div className="text-sm text-gray-400">{new Date(session.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="text-white font-medium">{session.cardsStudied}</div>
                          <div className="text-gray-400">cards</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">{formatTime(session.timeSpent)}</div>
                          <div className="text-gray-400">time</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-medium ${
                              session.accuracy >= 90
                                ? "text-green-400"
                                : session.accuracy >= 80
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {session.accuracy}%
                          </div>
                          <div className="text-gray-400">accuracy</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
