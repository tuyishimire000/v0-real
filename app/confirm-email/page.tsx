"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, AlertCircle, Loader2, Mail, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, resendConfirmation } = useAuth()
  const [status, setStatus] = useState<"waiting" | "success" | "error">("waiting")
  const [message, setMessage] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const email = searchParams?.get("email") || ""

  useEffect(() => {
    // If user is already authenticated, they've confirmed their email
    if (user) {
      setStatus("success")
      setMessage("Your email has been confirmed successfully!")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }
  }, [user, router])

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendConfirmation = async () => {
    if (!email) {
      setStatus("error")
      setMessage("Email address not found. Please try registering again.")
      return
    }

    setResendLoading(true)
    try {
      await resendConfirmation(email)
      setResendCooldown(60) // 60 second cooldown
    } catch (error) {
      // Error is handled in the auth provider
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "waiting" && <Mail className="h-12 w-12 text-blue-500" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === "error" && <AlertCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle>
            {status === "waiting" && "Check your email"}
            {status === "success" && "Email confirmed!"}
            {status === "error" && "Confirmation failed"}
          </CardTitle>
          <CardDescription>
            {status === "waiting" && email && (
              <>
                We've sent a confirmation link to <strong>{email}</strong>. Please check your email and click the link
                to activate your account.
              </>
            )}
            {status === "success" && "You will be redirected to your dashboard shortly."}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "waiting" && (
            <>
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or click below to resend.
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend confirmation email
                    </>
                  )}
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Wrong email address?</p>
                <Button variant="ghost" asChild>
                  <Link href="/register">Try again with a different email</Link>
                </Button>
              </div>
            </>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Welcome to the learning platform! You can now access all courses and features.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <Button asChild className="w-full">
                <Link href="/register">Try registering again</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
