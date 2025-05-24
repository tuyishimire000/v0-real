"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, BookOpen, Trophy, Users, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        setShowContent(true)
        // Clear any pending user data from localStorage
        localStorage.removeItem("pendingUserData")
      }
    }
  }, [user, loading, router])

  if (loading || !showContent) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Welcome to the Learning Platform!</CardTitle>
            <CardDescription>
              Your email has been confirmed and your account is now active. Let's get you started on your learning
              journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">What you can do now:</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <h4 className="font-medium">Explore Courses</h4>
                    <p className="text-sm text-muted-foreground">Browse and enroll in expert-led courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div className="text-left">
                    <h4 className="font-medium">Complete Challenges</h4>
                    <p className="text-sm text-muted-foreground">Apply your skills with real-world projects</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Users className="h-8 w-8 text-green-500" />
                  <div className="text-left">
                    <h4 className="font-medium">Join the Community</h4>
                    <p className="text-sm text-muted-foreground">Connect with fellow learners and mentors</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
