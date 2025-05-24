import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_callback_error&message=${encodeURIComponent(error.message)}`,
        )
      }

      if (data.session && data.user) {
        // Check if user profile exists
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // User profile doesn't exist, create it
          let userName = data.user.user_metadata?.name || data.user.email!.split("@")[0]

          // For email confirmations, try to get the name from user metadata
          if (type === "signup" && data.user.user_metadata?.name) {
            userName = data.user.user_metadata.name
          }

          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            name: userName,
            role: "student",
            xp: 0,
            level: 1,
          })

          if (insertError) {
            console.error("Error creating user profile:", insertError)
            return NextResponse.redirect(`${requestUrl.origin}/login?error=profile_creation_error`)
          }
        }

        // Handle different auth types
        if (type === "recovery") {
          return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
        } else if (type === "signup") {
          return NextResponse.redirect(`${requestUrl.origin}/welcome`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}${next}`)
        }
      }
    } catch (error) {
      console.error("Unexpected auth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
