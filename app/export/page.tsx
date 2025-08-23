"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Brain, Download, FileText, Database, Table, ArrowLeft, Loader2 } from "lucide-react"

interface StudyDeck {
  id: string
  name: string
  cards: any[]
  createdAt: string
  totalCards: number
}

export default function ExportPage() {
  const [decks, setDecks] = useState<StudyDeck[]>([])
  const [selectedDecks, setSelectedDecks] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedDecks = JSON.parse(localStorage.getItem("flashcardDecks") || "[]")
    setDecks(storedDecks)
  }, [])

  const handleDeckSelection = (deckId: string, checked: boolean) => {
    if (checked) {
      setSelectedDecks((prev) => [...prev, deckId])
    } else {
      setSelectedDecks((prev) => prev.filter((id) => id !== deckId))
    }
  }

  const handleExport = async () => {
    if (selectedDecks.length === 0 || !exportFormat) return

    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      const selectedDeckData = decks.filter((deck) => selectedDecks.includes(deck.id))

      if (exportFormat === "pdf") {
        // Simulate PDF generation
        console.log("Generating PDF for decks:", selectedDeckData)
        alert("PDF export completed! Check your downloads folder.")
      } else if (exportFormat === "anki") {
        // Simulate Anki export
        console.log("Generating Anki file for decks:", selectedDeckData)
        alert("Anki export completed! Import the .apkg file into Anki.")
      } else if (exportFormat === "csv") {
        // Simulate CSV export
        console.log("Generating CSV for decks:", selectedDeckData)
        alert("CSV export completed! Check your downloads folder.")
      }

      setIsExporting(false)
    }, 2000)
  }

  const exportFormats = [
    {
      value: "pdf",
      label: "PDF Document",
      description: "Printable flashcards with questions and answers",
      icon: FileText,
    },
    {
      value: "anki",
      label: "Anki Deck (.apkg)",
      description: "Import directly into Anki for spaced repetition",
      icon: Database,
    },
    {
      value: "csv",
      label: "CSV Spreadsheet",
      description: "Comma-separated values for Excel or Google Sheets",
      icon: Table,
    },
  ]

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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Export Your Decks</h1>
          <p className="text-gray-300 text-lg">Export your flashcard decks to various formats - completely free!</p>
        </div>

        <div className="space-y-8">
          {/* Deck Selection */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Select Decks to Export</CardTitle>
              <CardDescription className="text-gray-300">
                Choose which flashcard decks you want to export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {decks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No decks available to export</p>
                  <Button
                    onClick={() => router.push("/upload")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Your First Deck
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {decks.map((deck) => (
                    <div key={deck.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <Checkbox
                        id={deck.id}
                        checked={selectedDecks.includes(deck.id)}
                        onCheckedChange={(checked) => handleDeckSelection(deck.id, checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-blue-600"
                      />
                      <div className="flex-1">
                        <label htmlFor={deck.id} className="text-white font-medium cursor-pointer">
                          {deck.name}
                        </label>
                        <p className="text-sm text-gray-400">
                          {deck.totalCards} cards • Created {new Date(deck.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Export Format</CardTitle>
              <CardDescription className="text-gray-300">
                Choose the format for your exported flashcards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {exportFormats.map((format) => {
                  const Icon = format.icon
                  return (
                    <div
                      key={format.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        exportFormat === format.value
                          ? "border-blue-500 bg-blue-600/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      onClick={() => setExportFormat(format.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-blue-400" />
                        <div>
                          <h3 className="text-white font-medium">{format.label}</h3>
                          <p className="text-sm text-gray-400">{format.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-600/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Export</h3>
              <p className="text-gray-300 mb-4">
                {selectedDecks.length} deck{selectedDecks.length !== 1 ? "s" : ""} selected
                {exportFormat && ` • ${exportFormats.find((f) => f.value === exportFormat)?.label}`}
              </p>
              <Button
                onClick={handleExport}
                disabled={selectedDecks.length === 0 || !exportFormat || isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Decks
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
