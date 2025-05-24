"use server"

import { createClient } from "@/utils/supabase/server"

export async function getChallenges(userId?: string) {
  const supabase = createClient()

  try {
    const { data: challenges, error } = await supabase
      .from("challenges")
      .select(`
        *,
        course:courses(id, title),
        submissions:submissions(
          id,
          status,
          submitted_at,
          user_id
        )
      `)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching challenges:", error)
      return { success: false, error: error.message }
    }

    // Filter user-specific submissions if userId provided
    const challengesWithUserData =
      challenges?.map((challenge) => ({
        ...challenge,
        userSubmission: userId ? challenge.submissions?.find((sub: any) => sub.user_id === userId) : null,
        totalSubmissions: challenge.submissions?.length || 0,
      })) || []

    return { success: true, challenges: challengesWithUserData }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function getChallengeById(challengeId: string, userId?: string) {
  const supabase = createClient()

  try {
    const { data: challenge, error } = await supabase
      .from("challenges")
      .select(`
        *,
        course:courses(id, title),
        submissions:submissions(
          id,
          user_id,
          content,
          files,
          status,
          feedback,
          grade,
          submitted_at,
          reviewed_at,
          reviewed_by,
          reviewer:users!submissions_reviewed_by_fkey(name, role)
        )
      `)
      .eq("id", challengeId)
      .single()

    if (error) {
      console.error("Error fetching challenge:", error)
      return { success: false, error: error.message }
    }

    const userSubmission = userId ? challenge.submissions?.find((sub: any) => sub.user_id === userId) : null

    const otherSubmissions =
      challenge.submissions?.filter((sub: any) => sub.user_id !== userId && sub.status === "approved") || []

    return {
      success: true,
      challenge: {
        ...challenge,
        userSubmission,
        otherSubmissions,
        totalSubmissions: challenge.submissions?.length || 0,
      },
    }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function submitChallenge(challengeId: string, userId: string, content: string, files?: any[]) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("submissions").insert({
      challenge_id: challengeId,
      user_id: userId,
      content,
      files: files || [],
      status: "submitted",
    })

    if (error) {
      console.error("Error submitting challenge:", error)
      return { success: false, error: error.message }
    }

    // Award XP for submission
    const { data: challenge } = await supabase.from("challenges").select("xp_reward").eq("id", challengeId).single()

    if (challenge) {
      await supabase.rpc("add_user_xp", {
        user_id: userId,
        xp_amount: challenge.xp_reward,
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateSubmission(submissionId: string, content: string, files?: any[]) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("submissions")
      .update({
        content,
        files: files || [],
        submitted_at: new Date().toISOString(),
      })
      .eq("id", submissionId)

    if (error) {
      console.error("Error updating submission:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function reviewSubmission(
  submissionId: string,
  reviewerId: string,
  status: "approved" | "rejected",
  feedback: string,
  grade?: number,
) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("submissions")
      .update({
        status,
        feedback,
        grade,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq("id", submissionId)

    if (error) {
      console.error("Error reviewing submission:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function addSubmissionComment(submissionId: string, userId: string, comment: string) {
  const supabase = createClient()

  try {
    // For now, we'll store comments in the feedback field
    // In a real app, you'd want a separate comments table
    const { data: submission } = await supabase.from("submissions").select("feedback").eq("id", submissionId).single()

    const existingFeedback = submission?.feedback || ""
    const newFeedback = existingFeedback + `\n\n[Comment] ${comment}`

    const { error } = await supabase.from("submissions").update({ feedback: newFeedback }).eq("id", submissionId)

    if (error) {
      console.error("Error adding comment:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}
