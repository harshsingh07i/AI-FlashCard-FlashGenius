"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, RotateCcw, CheckCircle, XCircle, ArrowLeft, ArrowRight, Target, Clock, Calendar } from "lucide-react"
import Link from "next/link"

interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: "Easy" | "Medium" | "Hard"
  category?: string
}

interface StudyDeck {
  id: string
  name: string
  cards: Flashcard[]
  createdAt: string
  totalCards: number
}

interface StudySession {
  currentCardIndex: number
  isFlipped: boolean
  correctAnswers: number
  incorrectAnswers: number
  startTime: Date
  cardResults: { [cardId: string]: "correct" | "incorrect" | "skipped" }
  mode: "review" | "quiz"
}

export default function StudyPage() {
  const [decks, setDecks] = useState<StudyDeck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<StudyDeck | null>(null)
  const [session, setSession] = useState<StudySession | null>(null)
  const [studyMode, setStudyMode] = useState<"review" | "quiz">("review")
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const deckId = searchParams.get("deck")

  useEffect(() => {
    // Load decks from localStorage
    const storedDecks = JSON.parse(localStorage.getItem("flashcardDecks") || "[]")
    setDecks(storedDecks)

    // Check if a specific deck was requested
    if (deckId && storedDecks.length > 0) {
      const deck = storedDecks.find((d: StudyDeck) => d.id === deckId)
      if (deck) {
        setSelectedDeck(deck)
      }
    }
  }, [deckId]) // Use deckId instead of searchParams object

  const startStudySession = (deck: StudyDeck, mode: "review" | "quiz") => {
    // Shuffle cards for variety
    const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5)
    const deckWithShuffledCards = { ...deck, cards: shuffledCards }

    setSelectedDeck(deckWithShuffledCards)
    setSession({
      currentCardIndex: 0,
      isFlipped: false,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: new Date(),
      cardResults: {},
      mode,
    })
    setShowResults(false)
  }

  const flipCard = () => {
    if (session) {
      setSession((prev) => (prev ? { ...prev, isFlipped: !prev.isFlipped } : null))
    }
  }

  const markAnswer = (isCorrect: boolean) => {
    if (!session || !selectedDeck) return

    const currentCard = selectedDeck.cards[session.currentCardIndex]
    const newResults = {
      ...session.cardResults,
      [currentCard.id]: isCorrect ? "correct" : "incorrect",
    }

    setSession((prev) =>
      prev
        ? {
            ...prev,
            correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
            incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
            cardResults: newResults,
          }
        : null,
    )

    // Move to next card after a short delay
    setTimeout(() => {
      nextCard()
    }, 500)
  }

  const nextCard = () => {
    if (!session || !selectedDeck) return

    if (session.currentCardIndex < selectedDeck.cards.length - 1) {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              currentCardIndex: prev.currentCardIndex + 1,
              isFlipped: false,
            }
          : null,
      )
    } else {
      // End of session
      setShowResults(true)
    }
  }

  const previousCard = () => {
    if (!session) return

    if (session.currentCardIndex > 0) {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              currentCardIndex: prev.currentCardIndex - 1,
              isFlipped: false,
            }
          : null,
      )
    }
  }

  const resetSession = () => {
    setSession(null)
    setShowResults(false)
  }

  const getSessionStats = () => {
    if (!session || !selectedDeck) return null

    const totalAnswered = session.correctAnswers + session.incorrectAnswers
    const accuracy = totalAnswered > 0 ? Math.round((session.correctAnswers / totalAnswered) * 100) : 0
    const timeElapsed = Math.round((new Date().getTime() - session.startTime.getTime()) / 1000 / 60)

    return { totalAnswered, accuracy, timeElapsed }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-600/20 text-green-400 border-green-600/30"
      case "Medium":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
      case "Hard":
        return "bg-red-600/20 text-red-400 border-red-600/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
    }
  }

  if (showResults && session && selectedDeck) {
    const stats = getSessionStats()
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
                Back to Dashboard
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Study Session Complete!</CardTitle>
              <CardDescription className="text-gray-300">Great job studying {selectedDeck.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{stats?.accuracy}%</div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{session.correctAnswers}</div>
                  <div className="text-sm text-gray-400">Correct Answers</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{stats?.timeElapsed}m</div>
                  <div className="text-sm text-gray-400">Time Spent</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Card Results</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedDeck.cards.map((card, index) => {
                    const result = session.cardResults[card.id]
                    return (
                      <div key={card.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium truncate">{card.question}</div>
                          <Badge className={getDifficultyColor(card.difficulty)} size="sm">
                            {card.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {result === "correct" && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {result === "incorrect" && <XCircle className="h-5 w-5 text-red-400" />}
                          {!result && <div className="h-5 w-5 bg-gray-600 rounded-full" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => startStudySession(selectedDeck, session.mode)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Study Again
                </Button>
                <Button
                  onClick={resetSession}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                >
                  Choose Different Deck
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (session && selectedDeck) {
    const currentCard = selectedDeck.cards[session.currentCardIndex]
    const progress = ((session.currentCardIndex + 1) / selectedDeck.cards.length) * 100
    const stats = getSessionStats()

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">FlashGenius</span>
                </div>
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">{selectedDeck.name}</Badge>
              </div>
              <Button onClick={resetSession} variant="ghost" className="text-white hover:text-blue-400">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Exit Study
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Progress and Stats */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between text-white">
              <span className="text-lg font-medium">
                Card {session.currentCardIndex + 1} of {selectedDeck.cards.length}
              </span>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{session.correctAnswers}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span>{session.incorrectAnswers}</span>
                </div>
                {stats && (
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span>{stats.accuracy}%</span>
                  </div>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Flashcard */}
          <div className="mb-8">
            <Card
              className={`bg-gray-800/50 border-gray-700 backdrop-blur-sm min-h-[400px] cursor-pointer transition-all duration-300 hover:bg-gray-800/70 ${
                session.isFlipped ? "transform" : ""
              }`}
              onClick={flipCard}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(currentCard.difficulty)}>{currentCard.difficulty}</Badge>
                  <Badge className="bg-gray-600/20 text-gray-300 border-gray-600/30">
                    {session.isFlipped ? "Answer" : "Question"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="text-xl md:text-2xl text-white mb-4 leading-relaxed">
                    {session.isFlipped ? currentCard.answer : currentCard.question}
                  </div>
                  {!session.isFlipped && <p className="text-gray-400 text-sm">Click to reveal answer</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col space-y-4">
            {session.isFlipped && session.mode === "quiz" && (
              <div className="flex justify-center space-x-4">
                <Button onClick={() => markAnswer(false)} className="bg-red-600 hover:bg-red-700 text-white px-8">
                  <XCircle className="mr-2 h-4 w-4" />
                  Incorrect
                </Button>
                <Button onClick={() => markAnswer(true)} className="bg-green-600 hover:bg-green-700 text-white px-8">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Correct
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                onClick={previousCard}
                disabled={session.currentCardIndex === 0}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {session.mode === "review" && (
                <Button onClick={flipCard} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {session.isFlipped ? "Show Question" : "Show Answer"}
                </Button>
              )}

              <Button
                onClick={nextCard}
                disabled={session.currentCardIndex === selectedDeck.cards.length - 1}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
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
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Study Your Decks</h1>
          <p className="text-gray-300 text-lg">Choose a deck and study mode to begin your learning session</p>
        </div>

        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-600/30 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Spaced Repetition</h3>
                  <p className="text-gray-300">Optimize your learning with scientifically-proven intervals</p>
                </div>
              </div>
              <Link href="/study/spaced-repetition">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Start Spaced Review</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {decks.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Decks Available</h3>
              <p className="text-gray-300 mb-6">Create your first flashcard deck to start studying</p>
              <Button onClick={() => router.push("/upload")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Your First Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Study Mode Selection */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Study Mode</CardTitle>
                <CardDescription className="text-gray-300">
                  Choose how you want to study your flashcards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={studyMode} onValueChange={(value: any) => setStudyMode(value)}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="review">Review Mode - Flip through cards at your own pace</SelectItem>
                    <SelectItem value="quiz">Quiz Mode - Test yourself and track accuracy</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Deck Selection */}
            <div className="grid gap-4">
              {decks.map((deck) => (
                <Card
                  key={deck.id}
                  className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{deck.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{deck.totalCards} cards</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Created {new Date(deck.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => startStudySession(deck, studyMode)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Start Studying
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
