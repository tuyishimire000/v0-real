"use server"

import { createClient } from "@/utils/supabase/server"

export async function getAdminStats() {
  const supabase = createClient()

  try {
    // Get total users
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Get total courses
    const { count: totalCourses } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    // Get total enrollments
    const { count: totalEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })

    // Get total submissions
    const { count: totalSubmissions } = await supabase.from("submissions").select("*", { count: "exact", head: true })

    // Get completed enrollments for completion rate
    const { count: completedEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("completed", true)

    // Get active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", thirtyDaysAgo.toISOString())

    // Calculate completion rate
    const completionRate =
      totalEnrollments && totalEnrollments > 0 ? Math.round(((completedEnrollments || 0) / totalEnrollments) * 100) : 0

    // Calculate monthly growth (simplified - comparing last 30 days to previous 30 days)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const { count: usersLastMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString())

    const { count: usersPreviousMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo.toISOString())
      .lt("created_at", thirtyDaysAgo.toISOString())

    const monthlyGrowth =
      usersPreviousMonth && usersPreviousMonth > 0
        ? Math.round((((usersLastMonth || 0) - usersPreviousMonth) / usersPreviousMonth) * 100)
        : 0

    return {
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalSubmissions: totalSubmissions || 0,
        completionRate,
        activeUsers: activeUsers || 0,
        monthlyGrowth,
      },
    }
  } catch (error: any) {
    console.error("Error fetching admin stats:", error)
    return { success: false, error: error.message }
  }
}

export async function getRecentUsers() {
  const supabase = createClient()

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, xp, level, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return { success: true, users: users || [] }
  } catch (error: any) {
    console.error("Error fetching recent users:", error)
    return { success: false, error: error.message }
  }
}

export async function getRecentEnrollments() {
  const supabase = createClient()

  try {
    const { data: enrollments, error } = await supabase
      .from("course_enrollments")
      .select(`
        id,
        enrolled_at,
        user:users(name),
        course:courses(title)
      `)
      .order("enrolled_at", { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    const formattedEnrollments =
      enrollments?.map((enrollment: any) => ({
        id: enrollment.id,
        user_name: enrollment.user?.name || "Unknown User",
        course_title: enrollment.course?.title || "Unknown Course",
        enrolled_at: enrollment.enrolled_at,
      })) || []

    return { success: true, enrollments: formattedEnrollments }
  } catch (error: any) {
    console.error("Error fetching recent enrollments:", error)
    return { success: false, error: error.message }
  }
}

export async function getRecentSubmissions() {
  const supabase = createClient()

  try {
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(`
        id,
        status,
        submitted_at,
        user:users(name),
        challenge:challenges(title)
      `)
      .order("submitted_at", { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    const formattedSubmissions =
      submissions?.map((submission: any) => ({
        id: submission.id,
        user_name: submission.user?.name || "Unknown User",
        challenge_title: submission.challenge?.title || "Unknown Challenge",
        status: submission.status,
        submitted_at: submission.submitted_at,
      })) || []

    return { success: true, submissions: formattedSubmissions }
  } catch (error: any) {
    console.error("Error fetching recent submissions:", error)
    return { success: false, error: error.message }
  }
}

export async function getAllUsers(page = 1, limit = 20, search?: string) {
  const supabase = createClient()

  try {
    let query = supabase.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error, count } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    return {
      success: true,
      users: users || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserRole(userId: string, role: "student" | "mentor" | "admin") {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("users").update({ role }).eq("id", userId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating user role:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteUser(userId: string) {
  const supabase = createClient()

  try {
    // Delete user profile
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return { success: false, error: error.message }
  }
}

export async function getAllCourses(page = 1, limit = 20, search?: string) {
  const supabase = createClient()

  try {
    let query = supabase
      .from("courses")
      .select(
        `
        *,
        instructor:users(name),
        enrollments:course_enrollments(id),
        modules:modules(id),
        challenges:challenges(id)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data: courses, error, count } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    const formattedCourses =
      courses?.map((course: any) => ({
        ...course,
        instructor_name: course.instructor?.name || "Unknown",
        enrollment_count: course.enrollments?.length || 0,
        module_count: course.modules?.length || 0,
        challenge_count: course.challenges?.length || 0,
      })) || []

    return {
      success: true,
      courses: formattedCourses,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error: any) {
    console.error("Error fetching courses:", error)
    return { success: false, error: error.message }
  }
}

export async function updateCourseStatus(courseId: string, status: "draft" | "published" | "archived") {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("courses")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", courseId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating course status:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteCourse(courseId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("courses").delete().eq("id", courseId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting course:", error)
    return { success: false, error: error.message }
  }
}
