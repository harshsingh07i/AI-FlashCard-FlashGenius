"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Camera, User, Settings, Shield, Trash2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "",
    joinDate: "January 2024",
    studyStreak: 15,
    totalCards: 1247,
    accuracy: 87,
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setProfileForm({
        name: parsedUser.name,
        email: parsedUser.email,
      })
    }
  }, [])

  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    studyReminders: true,
    weeklyReports: false,
    darkMode: false,
    soundEffects: true,
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUpdateSuccess(false)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedUser = {
      ...user,
      name: profileForm.name,
      email: profileForm.email,
    }

    setUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))

    setIsLoading(false)
    setUpdateSuccess(true)

    // Hide success message after 3 seconds
    setTimeout(() => setUpdateSuccess(false), 3000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    setIsLoading(false)
    alert("Password updated successfully!")
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const updatedUser = {
          ...user,
          avatar: e.target?.result as string,
        }
        setUser(updatedUser)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("flashcardDecks")
    localStorage.removeItem("contentForFlashcards")
    router.push("/auth/login")
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("flashcardDecks")
      localStorage.removeItem("contentForFlashcards")
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10">
              ← Back
            </Button>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-white/20">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-white/20">
                <Trash2 className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-300">Update your profile details and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                      <p className="text-gray-300">{user.email}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Member since {user.joinDate}</Badge>
                        <Badge className="bg-green-600">{user.studyStreak} day streak</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Profile Form */}
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    {updateSuccess && (
                      <div className="bg-green-600/20 border border-green-600/30 text-green-400 px-4 py-2 rounded-lg">
                        Profile updated successfully!
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.totalCards}</div>
                      <div className="text-sm text-gray-300">Cards Studied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.accuracy}%</div>
                      <div className="text-sm text-gray-300">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.studyStreak}</div>
                      <div className="text-sm text-gray-300">Day Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Change Password</CardTitle>
                  <CardDescription className="text-gray-300">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Updating..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Notifications</CardTitle>
                  <CardDescription className="text-gray-300">Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-300">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Study Reminders</Label>
                      <p className="text-sm text-gray-300">Daily study session reminders</p>
                    </div>
                    <Switch
                      checked={preferences.studyReminders}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, studyReminders: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Weekly Reports</Label>
                      <p className="text-sm text-gray-300">Weekly progress summaries</p>
                    </div>
                    <Switch
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, weeklyReports: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">App Preferences</CardTitle>
                  <CardDescription className="text-gray-300">Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Sound Effects</Label>
                      <p className="text-sm text-gray-300">Play sounds for interactions</p>
                    </div>
                    <Switch
                      checked={preferences.soundEffects}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, soundEffects: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Account Actions</CardTitle>
                  <CardDescription className="text-gray-300">Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Sign Out
                  </Button>

                  <Separator className="bg-white/20" />

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                    <p className="text-sm text-gray-300">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
