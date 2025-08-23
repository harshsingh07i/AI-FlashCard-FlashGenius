"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Check, Download, Volume2, Users, BarChart3, ArrowLeft } from "lucide-react"

export default function FeaturesPage() {
  const router = useRouter()

  const features = [
    "Unlimited flashcards",
    "Advanced AI generation",
    "Spaced repetition algorithm",
    "Export to PDF, Anki, CSV",
    "Voice synthesis",
    "Collaboration features",
    "Advanced analytics",
    "Mobile app access",
    "Community support",
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            All Features
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {" "}
              Included Free
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Enjoy all the powerful AI features, advanced analytics, and collaboration tools at no cost
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl text-white mb-4">FlashGenius Free</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Everything you need for effective learning, completely free
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-semibold text-lg py-3"
              >
                Start Learning Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-center p-6">
            <Download className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Export Anywhere</h3>
            <p className="text-gray-300 text-sm">Export to PDF, Anki, CSV, and more formats</p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-center p-6">
            <Volume2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Voice Synthesis</h3>
            <p className="text-gray-300 text-sm">Listen to your flashcards with AI-powered voice</p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-center p-6">
            <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Collaboration</h3>
            <p className="text-gray-300 text-sm">Share decks and study together in real-time</p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-center p-6">
            <BarChart3 className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-300 text-sm">Deep insights into your learning patterns</p>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                question: "Is FlashGenius really completely free?",
                answer:
                  "Yes! All features including AI generation, spaced repetition, exports, and collaboration are completely free with no hidden costs.",
              },
              {
                question: "Are there any limits on the number of flashcards?",
                answer: "No limits! Create as many flashcards and decks as you need for your learning journey.",
              },
              {
                question: "Can I export my flashcards?",
                answer: "Export your decks to PDF, Anki, CSV, and other popular formats anytime.",
              },
              {
                question: "How does the AI generation work?",
                answer:
                  "Our AI analyzes your uploaded content and automatically generates relevant question-answer pairs optimized for learning.",
              },
            ].map((faq, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
