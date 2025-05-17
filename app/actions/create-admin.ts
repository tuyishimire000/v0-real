"use server"

import { createClient } from "@supabase/supabase-js"

export async function createAdminUser() {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Create the user with the admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@example.com",
      password: "password123",
      email_confirm: true,
      user_metadata: {
        name: "Admin User",
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return { success: false, error: authError.message }
    }

    if (!authUser.user) {
      return { success: false, error: "Failed to create user" }
    }

    // Create the user profile in the public.users table
    const { error: profileError } = await supabase.from("users").insert({
      id: authUser.user.id,
      email: authUser.user.email!,
      name: "Admin User",
      role: "admin",
      xp: 1000,
      level: 10,
    })

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      return { success: false, error: profileError.message }
    }

    return { success: true, userId: authUser.user.id }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}
