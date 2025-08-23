"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Zap, Target, Users, BookOpen, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          {[...Array(50)].map((_, i) => (
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

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold text-white">FlashGenius</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:text-blue-400">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">AI-Powered Learning Revolution</Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Transform Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Learning{" "}
            </span>
            Experience
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Generate intelligent flashcards from any content using advanced AI. Master subjects faster with spaced
            repetition and personalized learning paths - completely free!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powered by Advanced AI</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Experience the future of learning with intelligent features designed to maximize retention
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">AI Content Processing</CardTitle>
              <CardDescription className="text-gray-300">
                Upload PDFs, documents, or paste text. Our AI extracts key concepts and generates perfect flashcards
                instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardHeader>
              <Target className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Spaced Repetition</CardTitle>
              <CardDescription className="text-gray-300">
                Scientifically-proven Leitner algorithm adapts to your learning pace for maximum retention.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-400 mb-4" />
              <CardTitle className="text-white">Performance Analytics</CardTitle>
              <CardDescription className="text-gray-300">
                Track your progress with detailed analytics and insights to optimize your learning strategy.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle className="text-white">Collaborative Learning</CardTitle>
              <CardDescription className="text-gray-300">
                Share decks with classmates and study together with real-time collaboration features.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-cyan-400 mb-4" />
              <CardTitle className="text-white">Multi-Format Support</CardTitle>
              <CardDescription className="text-gray-300">
                Support for text, images, audio, and video content with voice synthesis for enhanced learning.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardHeader>
              <Brain className="h-12 w-12 text-pink-400 mb-4" />
              <CardTitle className="text-white">Smart Recommendations</CardTitle>
              <CardDescription className="text-gray-300">
                AI-powered suggestions for study sessions, difficulty adjustments, and content improvements.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-600/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Learning?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students and professionals who have revolutionized their study habits with FlashGenius -
              all features included, completely free!
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">FlashGenius</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 FlashGenius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
