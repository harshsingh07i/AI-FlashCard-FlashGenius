"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Brain, Wand2, Edit3, Trash2, Plus, Save, ArrowLeft, Loader2, CheckCircle, RefreshCw } from "lucide-react"

interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: "Easy" | "Medium" | "Hard"
  category?: string
}

interface GenerationSettings {
  numCards: number
  difficulty: "Mixed" | "Easy" | "Medium" | "Hard"
  cardType: "Mixed" | "Definition" | "Concept" | "Example"
  deckName: string
}

export default function GeneratePage() {
  const [content, setContent] = useState("")
  const [settings, setSettings] = useState<GenerationSettings>({
    numCards: 10,
    difficulty: "Mixed",
    cardType: "Mixed",
    deckName: "",
  })
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get content from localStorage (from upload page)
    const storedContent = localStorage.getItem("contentForFlashcards")
    if (storedContent) {
      setContent(storedContent)
      // Generate a default deck name from content
      const words = storedContent.split(" ").slice(0, 3).join(" ")
      setSettings((prev) => ({ ...prev, deckName: `${words} Flashcards` }))
    } else {
      router.push("/upload")
    }
  }, [router])

  const generateFlashcards = async () => {
    setIsGenerating(true)

    try {
      console.log("[v0] Starting flashcard generation with content:", content.substring(0, 100))
      console.log("[v0] Settings:", settings)

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          difficulty: settings.difficulty,
          cardCount: settings.numCards,
          cardType: settings.cardType,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      // Handle streaming response from Grok AI
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
        }
      }

      console.log("[v0] Full AI response:", fullResponse)

      // Parse the AI response to extract flashcards
      try {
        // Clean up the response to extract JSON
        const jsonMatch = fullResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const aiGeneratedCards = JSON.parse(jsonMatch[0])
          console.log("[v0] Parsed AI cards:", aiGeneratedCards)

          const formattedCards: Flashcard[] = aiGeneratedCards.map((card: any, index: number) => ({
            id: Math.random().toString(36).substr(2, 9),
            question: card.question || `Question ${index + 1}`,
            answer: card.answer || `Answer ${index + 1}`,
            difficulty: card.difficulty || "Medium",
            category: card.type || settings.cardType !== "Mixed" ? settings.cardType : undefined,
          }))
          setFlashcards(formattedCards)
        } else {
          console.log("[v0] JSON parsing failed, trying line-by-line parsing")

          // Try to extract Q&A pairs from the response
          const lines = fullResponse.split("\n").filter((line) => line.trim())
          const fallbackCards: Flashcard[] = []

          // Look for Q: and A: patterns
          let currentQuestion = ""
          let currentAnswer = ""

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.toLowerCase().startsWith("q:") || trimmedLine.toLowerCase().startsWith("question:")) {
              if (currentQuestion && currentAnswer) {
                fallbackCards.push({
                  id: Math.random().toString(36).substr(2, 9),
                  question: currentQuestion,
                  answer: currentAnswer,
                  difficulty:
                    settings.difficulty !== "Mixed" ? (settings.difficulty as "Easy" | "Medium" | "Hard") : "Medium",
                  category: settings.cardType !== "Mixed" ? settings.cardType : undefined,
                })
              }
              currentQuestion = trimmedLine.replace(/^(q:|question:)/i, "").trim()
              currentAnswer = ""
            } else if (trimmedLine.toLowerCase().startsWith("a:") || trimmedLine.toLowerCase().startsWith("answer:")) {
              currentAnswer = trimmedLine.replace(/^(a:|answer:)/i, "").trim()
            } else if (currentQuestion && !currentAnswer && trimmedLine) {
              // If we have a question but no answer marker, treat the next line as answer
              currentAnswer = trimmedLine
            }
          }

          // Add the last card if we have both question and answer
          if (currentQuestion && currentAnswer) {
            fallbackCards.push({
              id: Math.random().toString(36).substr(2, 9),
              question: currentQuestion,
              answer: currentAnswer,
              difficulty:
                settings.difficulty !== "Mixed" ? (settings.difficulty as "Easy" | "Medium" | "Hard") : "Medium",
              category: settings.cardType !== "Mixed" ? settings.cardType : undefined,
            })
          }

          if (fallbackCards.length > 0) {
            console.log("[v0] Generated fallback cards:", fallbackCards)
            setFlashcards(fallbackCards)
          } else {
            throw new Error("Could not parse AI response into flashcards")
          }
        }
      } catch (parseError) {
        console.error("[v0] Error parsing AI response:", parseError)
        alert(
          "The AI generated content but we couldn't format it properly. Please try again with different settings or content.",
        )
      }
    } catch (error) {
      console.error("[v0] Error generating flashcards:", error)
      if (error instanceof Error) {
        alert(`Failed to generate flashcards: ${error.message}. Please check your connection and try again.`)
      } else {
        alert("Failed to generate flashcards. Please check your connection and try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const extractConcepts = (text: string) => {
    // Simple concept extraction simulation
    const concepts = []
    const words = text.toLowerCase().split(/\W+/)
    const importantWords = words.filter(
      (word) =>
        word.length > 6 &&
        ![
          "the",
          "and",
          "that",
          "this",
          "with",
          "from",
          "they",
          "have",
          "been",
          "their",
          "would",
          "there",
          "could",
          "other",
        ].includes(word),
    )

    for (let i = 0; i < Math.min(5, importantWords.length); i++) {
      concepts.push({
        term: importantWords[i].charAt(0).toUpperCase() + importantWords[i].slice(1),
        definition: null,
        complexity: Math.random() > 0.5 ? "Medium" : ("Hard" as "Medium" | "Hard"),
      })
    }

    return concepts
  }

  const extractKeyPhrase = (sentence: string) => {
    const words = sentence.split(" ")
    const keyWords = words.filter((word) => word.length > 4)
    return keyWords[0] || words[0] || "this topic"
  }

  const updateCard = (cardId: string, field: "question" | "answer", value: string) => {
    setFlashcards((prev) => prev.map((card) => (card.id === cardId ? { ...card, [field]: value } : card)))
  }

  const deleteCard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== cardId))
  }

  const addNewCard = () => {
    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      question: "",
      answer: "",
      difficulty: "Medium",
    }
    setFlashcards((prev) => [...prev, newCard])
    setEditingCard(newCard.id)
  }

  const saveDeck = async () => {
    if (!settings.deckName.trim()) {
      alert("Please enter a deck name")
      return
    }

    if (flashcards.length === 0) {
      alert("Please generate some flashcards first")
      return
    }

    setIsSaving(true)

    try {
      // Simulate saving to database
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store in localStorage for now (would be database in real app)
      const existingDecks = JSON.parse(localStorage.getItem("flashcardDecks") || "[]")
      const newDeck = {
        id: Math.random().toString(36).substr(2, 9),
        name: settings.deckName,
        cards: flashcards,
        createdAt: new Date().toISOString(),
        totalCards: flashcards.length,
      }
      existingDecks.push(newDeck)
      localStorage.setItem("flashcardDecks", JSON.stringify(existingDecks))

      // Clear the content from localStorage
      localStorage.removeItem("contentForFlashcards")

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving deck:", error)
    } finally {
      setIsSaving(false)
    }
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
              <Separator orientation="vertical" className="h-6 bg-gray-600" />
              <span className="text-gray-300">AI Flashcard Generator</span>
            </div>
            <Button onClick={() => router.push("/upload")} variant="ghost" className="text-white hover:text-blue-400">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wand2 className="mr-2 h-5 w-5 text-blue-400" />
                  Generation Settings
                </CardTitle>
                <CardDescription className="text-gray-300">Customize your flashcard generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deckName" className="text-white">
                    Deck Name
                  </Label>
                  <Input
                    id="deckName"
                    value={settings.deckName}
                    onChange={(e) => setSettings((prev) => ({ ...prev, deckName: e.target.value }))}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                    placeholder="Enter deck name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Number of Cards: {settings.numCards}</Label>
                  <Slider
                    value={[settings.numCards]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, numCards: value[0] }))}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Difficulty Level</Label>
                  <Select
                    value={settings.difficulty}
                    onValueChange={(value: any) => setSettings((prev) => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Card Type</Label>
                  <Select
                    value={settings.cardType}
                    onValueChange={(value: any) => setSettings((prev) => ({ ...prev, cardType: value }))}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Definition">Definition</SelectItem>
                      <SelectItem value="Concept">Concept</SelectItem>
                      <SelectItem value="Example">Example</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={generateFlashcards}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Flashcards
                    </>
                  )}
                </Button>

                {flashcards.length > 0 && (
                  <>
                    <Separator className="bg-gray-600" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Generated Cards</span>
                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">{flashcards.length}</Badge>
                      </div>
                      <Button
                        onClick={addNewCard}
                        variant="outline"
                        className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Card
                      </Button>
                      <Button
                        onClick={saveDeck}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={isSaving || !settings.deckName.trim()}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Deck
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Content Preview */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">Source Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 text-xs max-h-32 overflow-y-auto">{content.substring(0, 200)}...</div>
              </CardContent>
            </Card>
          </div>

          {/* Flashcards Display */}
          <div className="lg:col-span-2">
            {flashcards.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate</h3>
                  <p className="text-gray-300 mb-4">
                    Configure your settings and click "Generate Flashcards" to create AI-powered study cards
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Generated Flashcards</h2>
                  <Button
                    onClick={generateFlashcards}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>

                <div className="grid gap-4">
                  {flashcards.map((card, index) => (
                    <Card key={card.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-gray-600/20 text-gray-300 border-gray-600/30">Card {index + 1}</Badge>
                            <Badge className={getDifficultyColor(card.difficulty)}>{card.difficulty}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingCard(editingCard === card.id ? null : card.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteCard(card.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">Question</Label>
                          {editingCard === card.id ? (
                            <Textarea
                              value={card.question}
                              onChange={(e) => updateCard(card.id, "question", e.target.value)}
                              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                              rows={2}
                            />
                          ) : (
                            <div className="text-gray-300 bg-gray-700/30 p-3 rounded-md">{card.question}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">Answer</Label>
                          {editingCard === card.id ? (
                            <Textarea
                              value={card.answer}
                              onChange={(e) => updateCard(card.id, "answer", e.target.value)}
                              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                              rows={3}
                            />
                          ) : (
                            <div className="text-gray-300 bg-gray-700/30 p-3 rounded-md">{card.answer}</div>
                          )}
                        </div>
                        {editingCard === card.id && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCard(null)}
                              className="border-gray-600 text-white hover:bg-gray-700"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setEditingCard(null)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Save
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
