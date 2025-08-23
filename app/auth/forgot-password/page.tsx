"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setIsEmailSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/abstract-digital-particles.png')] opacity-10"></div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20 relative z-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {isEmailSent ? "Check Your Email" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isEmailSent
              ? "We've sent a password reset link to your email address."
              : "Enter your email address and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isEmailSent ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-gray-300">
                If an account with <strong className="text-white">{email}</strong> exists, you will receive a password
                reset email shortly.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setIsEmailSent(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Try Another Email
                </Button>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
