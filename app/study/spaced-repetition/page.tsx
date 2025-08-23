"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Calendar, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { SpacedRepetitionSystem, type SpacedRepetitionCard, type CardProgress } from "@/lib/spaced-repetition"

interface StudySession {
  currentCardIndex: number
  isFlipped: boolean
  correctAnswers: number
  incorrectAnswers: number
  startTime: Date
  cardResults: { [cardId: string]: boolean }
}

export default function SpacedRepetitionPage() {
  const [allCards, setAllCards] = useState<SpacedRepetitionCard[]>([])
  const [dueCards, setDueCards] = useState<SpacedRepetitionCard[]>([])
  const [session, setSession] = useState<StudySession | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("due")
  const router = useRouter()

  useEffect(() => {
    loadSpacedRepetitionData()
  }, [])

  const loadSpacedRepetitionData = () => {
    // Load existing decks and convert to spaced repetition format
    const storedDecks = JSON.parse(localStorage.getItem("flashcardDecks") || "[]")
    const existingProgress = JSON.parse(localStorage.getItem("spacedRepetitionProgress") || "{}")

    const allSpacedCards: SpacedRepetitionCard[] = []

    storedDecks.forEach((deck: any) => {
      deck.cards.forEach((card: any) => {
        const progress = existingProgress[card.id] || SpacedRepetitionSystem.initializeCardProgress(card.id)

        allSpacedCards.push({
          ...card,
          progress: {
            ...progress,
            lastReviewed: new Date(progress.lastReviewed),
            nextReview: new Date(progress.nextReview),
          },
        })
      })
    })

    setAllCards(allSpacedCards)
    setDueCards(SpacedRepetitionSystem.getCardsForReview(allSpacedCards))
  }

  const saveProgress = (updatedCards: SpacedRepetitionCard[]) => {
    const progressData: { [cardId: string]: CardProgress } = {}
    updatedCards.forEach((card) => {
      progressData[card.id] = card.progress
    })
    localStorage.setItem("spacedRepetitionProgress", JSON.stringify(progressData))
  }

  const startSpacedRepetitionSession = () => {
    if (dueCards.length === 0) return

    // Shuffle due cards
    const shuffledCards = [...dueCards].sort(() => Math.random() - 0.5)
    setDueCards(shuffledCards)

    setSession({
      currentCardIndex: 0,
      isFlipped: false,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: new Date(),
      cardResults: {},
    })
    setShowResults(false)
  }

  const flipCard = () => {
    if (session) {
      setSession((prev) => (prev ? { ...prev, isFlipped: !prev.isFlipped } : null))
    }
  }

  const markAnswer = (isCorrect: boolean) => {
    if (!session || !dueCards[session.currentCardIndex]) return

    const currentCard = dueCards[session.currentCardIndex]

    // Update card progress using Leitner algorithm
    const updatedProgress = SpacedRepetitionSystem.updateCardProgress(currentCard.progress, isCorrect)
    const updatedCard = { ...currentCard, progress: updatedProgress }

    // Update the card in allCards array
    const updatedAllCards = allCards.map((card) => (card.id === currentCard.id ? updatedCard : card))
    setAllCards(updatedAllCards)

    // Update session
    setSession((prev) =>
      prev
        ? {
            ...prev,
            correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
            incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
            cardResults: { ...prev.cardResults, [currentCard.id]: isCorrect },
          }
        : null,
    )

    // Save progress
    saveProgress(updatedAllCards)

    // Move to next card after delay
    setTimeout(() => {
      if (session.currentCardIndex < dueCards.length - 1) {
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
        setShowResults(true)
      }
    }, 1000)
  }

  const resetSession = () => {
    setSession(null)
    setShowResults(false)
    loadSpacedRepetitionData() // Refresh data
  }

  const getBoxGroups = () => {
    return SpacedRepetitionSystem.getCardsByBox(allCards)
  }

  if (showResults && session) {
    const accuracy =
      session.correctAnswers + session.incorrectAnswers > 0
        ? Math.round((session.correctAnswers / (session.correctAnswers + session.incorrectAnswers)) * 100)
        : 0

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
              <CardTitle className="text-2xl text-white">Spaced Repetition Session Complete!</CardTitle>
              <CardDescription className="text-gray-300">
                Your cards have been scheduled for optimal review timing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{accuracy}%</div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{session.correctAnswers}</div>
                  <div className="text-sm text-gray-400">Correct</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-white">{dueCards.length}</div>
                  <div className="text-sm text-gray-400">Cards Reviewed</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={resetSession} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Continue Studying
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

  if (session && dueCards.length > 0) {
    const currentCard = dueCards[session.currentCardIndex]
    const progress = ((session.currentCardIndex + 1) / dueCards.length) * 100

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
                <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">Spaced Repetition</Badge>
              </div>
              <Button onClick={resetSession} variant="ghost" className="text-white hover:text-blue-400">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Exit Session
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Progress */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between text-white">
              <span className="text-lg font-medium">
                Card {session.currentCardIndex + 1} of {dueCards.length}
              </span>
              <div className="flex items-center space-x-4 text-sm">
                <Badge className={SpacedRepetitionSystem.getBoxColor(currentCard.progress.box)}>
                  Box {currentCard.progress.box}
                </Badge>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{session.correctAnswers}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span>{session.incorrectAnswers}</span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Flashcard */}
          <div className="mb-8">
            <Card
              className="bg-gray-800/50 border-gray-700 backdrop-blur-sm min-h-[400px] cursor-pointer transition-all duration-300 hover:bg-gray-800/70"
              onClick={flipCard}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={SpacedRepetitionSystem.getBoxColor(currentCard.progress.box)}>
                      {SpacedRepetitionSystem.getBoxName(currentCard.progress.box)}
                    </Badge>
                    <Badge className="bg-gray-600/20 text-gray-300 border-gray-600/30">
                      {SpacedRepetitionSystem.getAccuracyRate(currentCard.progress)}% accuracy
                    </Badge>
                  </div>
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
          {session.isFlipped && (
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
            <Button onClick={() => router.push("/study")} variant="ghost" className="text-white hover:text-blue-400">
              Back to Study
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Spaced Repetition</h1>
          <p className="text-gray-300 text-lg">Optimize your learning with scientifically-proven spaced intervals</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border-gray-700">
            <TabsTrigger value="due" className="text-white data-[state=active]:bg-blue-600">
              Due for Review ({dueCards.length})
            </TabsTrigger>
            <TabsTrigger value="boxes" className="text-white data-[state=active]:bg-blue-600">
              Leitner Boxes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="due" className="space-y-6">
            {dueCards.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Cards Due</h3>
                  <p className="text-gray-300 mb-6">All your cards are scheduled for future review. Great job!</p>
                  <Button onClick={() => router.push("/study")} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Regular Study Mode
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-600/30 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Ready for Spaced Repetition</h3>
                    <p className="text-gray-300 mb-4">
                      {dueCards.length} cards are due for review based on your learning progress
                    </p>
                    <Button
                      onClick={startSpacedRepetitionSession}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                    >
                      Start Review Session
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {dueCards.slice(0, 10).map((card) => (
                    <Card key={card.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium mb-1 truncate">{card.question}</div>
                            <div className="flex items-center space-x-2">
                              <Badge className={SpacedRepetitionSystem.getBoxColor(card.progress.box)}>
                                Box {card.progress.box}
                              </Badge>
                              <span className="text-sm text-gray-400">
                                {SpacedRepetitionSystem.getAccuracyRate(card.progress)}% accuracy
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <div>Reviews: {card.progress.totalReviews}</div>
                            <div>Streak: {card.progress.correctStreak}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {dueCards.length > 10 && (
                    <div className="text-center text-gray-400">And {dueCards.length - 10} more cards...</div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="boxes" className="space-y-6">
            <div className="grid gap-6">
              {Object.entries(getBoxGroups()).map(([box, cards]) => (
                <Card key={box} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={SpacedRepetitionSystem.getBoxColor(Number.parseInt(box))}>Box {box}</Badge>
                        <div>
                          <CardTitle className="text-white">
                            {SpacedRepetitionSystem.getBoxName(Number.parseInt(box))}
                          </CardTitle>
                          <CardDescription className="text-gray-300">{cards.length} cards</CardDescription>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        <div>
                          Review interval:{" "}
                          {box === "1"
                            ? "1 day"
                            : box === "2"
                              ? "3 days"
                              : box === "3"
                                ? "1 week"
                                : box === "4"
                                  ? "2 weeks"
                                  : "1 month"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {cards.length > 0 && (
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {cards.slice(0, 5).map((card) => (
                          <div key={card.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                            <div className="flex-1 truncate text-white text-sm">{card.question}</div>
                            <div className="text-xs text-gray-400 ml-2">
                              Next: {SpacedRepetitionSystem.getDaysUntilNextReview(card.progress)}d
                            </div>
                          </div>
                        ))}
                        {cards.length > 5 && (
                          <div className="text-center text-gray-400 text-sm">+{cards.length - 5} more cards</div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
