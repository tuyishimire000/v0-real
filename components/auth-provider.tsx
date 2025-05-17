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

      if (session) {
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        } else {
          setUser({
            ...session.user,
            role: userData.role,
            xp: userData.xp,
            level: userData.level,
            name: userData.name,
            avatar_url: userData.avatar_url,
          })
        }
      }

      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        } else {
          setUser({
            ...session.user,
            role: userData.role,
            xp: userData.xp,
            level: userData.level,
            name: userData.name,
            avatar_url: userData.avatar_url,
          })
        }
      } else {
        setUser(null)
      }

      setLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      })
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          name,
          role: "student",
          xp: 0,
          level: 1,
        })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
        }
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link.",
      })
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      })
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
