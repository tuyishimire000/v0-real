"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@supabase/supabase-js"

type UserWithProfile = User & {
  role: "student" | "mentor" | "admin"
  xp: number
  level: number
  name?: string
  avatar_url?: string
}

type AuthContextType = {
  user: UserWithProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resendConfirmation: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await fetchUserProfile(session.user)
      }

      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserProfile(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        await fetchUserProfile(session.user)
      }

      setLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const fetchUserProfile = async (authUser: User) => {
    try {
      // Use the service role or bypass RLS by using a simpler approach
      // First, try to get user data with a direct query
      const { data: userData, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (error) {
        console.error("Error fetching user data:", error)

        // If there's an RLS error, create a basic user profile from auth data
        if (error.code === "42501" || error.message.includes("policy") || error.message.includes("recursion")) {
          console.log("RLS policy issue detected, using auth user data")
          setUser({
            ...authUser,
            role: "student" as const,
            xp: 0,
            level: 1,
            name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
            avatar_url: authUser.user_metadata?.avatar_url || null,
          })
          return
        }

        setUser(null)
      } else if (userData) {
        setUser({
          ...authUser,
          role: userData.role,
          xp: userData.xp,
          level: userData.level,
          name: userData.name,
          avatar_url: userData.avatar_url,
        })
      } else {
        // User profile doesn't exist, create a basic one from auth data
        setUser({
          ...authUser,
          role: "student" as const,
          xp: 0,
          level: 1,
          name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
          avatar_url: authUser.user_metadata?.avatar_url || null,
        })
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)

      // Fallback: create user from auth data
      setUser({
        ...authUser,
        role: "student" as const,
        xp: 0,
        level: 1,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        avatar_url: authUser.user_metadata?.avatar_url || null,
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error types
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Please check your email and click the confirmation link before signing in.")
        } else if (error.message.includes("Too many requests")) {
          throw new Error("Too many login attempts. Please wait a few minutes before trying again.")
        } else {
          throw error
        }
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      toast({
        title: "Error signing in with Apple",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })

      if (error) {
        // Handle specific error types
        if (error.message.includes("Password should be at least")) {
          throw new Error("Password must be at least 6 characters long.")
        } else if (error.message.includes("Invalid email")) {
          throw new Error("Please enter a valid email address.")
        } else if (error.message.includes("User already registered")) {
          throw new Error("An account with this email already exists. Please sign in instead.")
        } else {
          throw error
        }
      }

      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Check your email",
          description:
            "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
        })

        // Store user data temporarily for when they confirm
        localStorage.setItem("pendingUserData", JSON.stringify({ name, email }))

        // Redirect to a waiting page
        router.push(`/confirm-email?email=${encodeURIComponent(email)}`)
        return
      }

      if (data.user && data.session) {
        // User is immediately signed in (email confirmation disabled)
        toast({
          title: "Account created successfully!",
          description: "Welcome to the learning platform. You can now start exploring courses.",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Confirmation email sent",
        description: "Please check your email for the confirmation link.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
  }

  const value = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signUp,
    signOut,
    resendConfirmation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
