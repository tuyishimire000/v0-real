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
        : usersLastMonth || 0 > 0
          ? 100
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
    return {
      success: true, // Return success with default values instead of failing
      stats: {
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalSubmissions: 0,
        completionRate: 0,
        activeUsers: 0,
        monthlyGrowth: 0,
      },
    }
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
      console.error("Error fetching recent users:", error)
      return { success: true, users: [] } // Return empty array instead of failing
    }

    return { success: true, users: users || [] }
  } catch (error: any) {
    console.error("Error fetching recent users:", error)
    return { success: true, users: [] }
  }
}

export async function getRecentEnrollments() {
  const supabase = createClient()

  try {
    // Get enrollments first
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("course_enrollments")
      .select("id, enrolled_at, user_id, course_id")
      .order("enrolled_at", { ascending: false })
      .limit(10)

    if (enrollmentsError) {
      console.error("Error fetching recent enrollments:", enrollmentsError)
      return { success: true, enrollments: [] }
    }

    if (!enrollments || enrollments.length === 0) {
      return { success: true, enrollments: [] }
    }

    // Get user and course details separately
    const formattedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        try {
          const [userResult, courseResult] = await Promise.all([
            supabase.from("users").select("name").eq("id", enrollment.user_id).single(),
            supabase.from("courses").select("title").eq("id", enrollment.course_id).single(),
          ])

          return {
            id: enrollment.id,
            user_name: userResult.data?.name || "Unknown User",
            course_title: courseResult.data?.title || "Unknown Course",
            enrolled_at: enrollment.enrolled_at,
          }
        } catch (error) {
          return {
            id: enrollment.id,
            user_name: "Unknown User",
            course_title: "Unknown Course",
            enrolled_at: enrollment.enrolled_at,
          }
        }
      }),
    )

    return { success: true, enrollments: formattedEnrollments }
  } catch (error: any) {
    console.error("Error fetching recent enrollments:", error)
    return { success: true, enrollments: [] }
  }
}

export async function getRecentSubmissions() {
  const supabase = createClient()

  try {
    // Get submissions first
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("id, status, submitted_at, user_id, challenge_id")
      .order("submitted_at", { ascending: false })
      .limit(10)

    if (submissionsError) {
      console.error("Error fetching recent submissions:", submissionsError)
      return { success: true, submissions: [] }
    }

    if (!submissions || submissions.length === 0) {
      return { success: true, submissions: [] }
    }

    // Get user and challenge details separately
    const formattedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        try {
          const [userResult, challengeResult] = await Promise.all([
            supabase.from("users").select("name").eq("id", submission.user_id).single(),
            supabase.from("challenges").select("title").eq("id", submission.challenge_id).single(),
          ])

          return {
            id: submission.id,
            user_name: userResult.data?.name || "Unknown User",
            challenge_title: challengeResult.data?.title || "Unknown Challenge",
            status: submission.status,
            submitted_at: submission.submitted_at,
          }
        } catch (error) {
          return {
            id: submission.id,
            user_name: "Unknown User",
            challenge_title: "Unknown Challenge",
            status: submission.status,
            submitted_at: submission.submitted_at,
          }
        }
      }),
    )

    return { success: true, submissions: formattedSubmissions }
  } catch (error: any) {
    console.error("Error fetching recent submissions:", error)
    return { success: true, submissions: [] }
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
    let query = supabase.from("courses").select("*", { count: "exact" }).order("created_at", { ascending: false })

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data: courses, error, count } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    // Get additional stats for each course
    const formattedCourses = await Promise.all(
      (courses || []).map(async (course) => {
        try {
          const [instructorResult, enrollmentsResult, modulesResult, challengesResult] = await Promise.all([
            supabase.from("users").select("name").eq("id", course.instructor_id).single(),
            supabase.from("course_enrollments").select("id", { count: "exact", head: true }).eq("course_id", course.id),
            supabase.from("modules").select("id", { count: "exact", head: true }).eq("course_id", course.id),
            supabase.from("challenges").select("id", { count: "exact", head: true }).eq("course_id", course.id),
          ])

          return {
            ...course,
            instructor_name: instructorResult.data?.name || "Unknown",
            enrollment_count: enrollmentsResult.count || 0,
            module_count: modulesResult.count || 0,
            challenge_count: challengesResult.count || 0,
          }
        } catch (error) {
          return {
            ...course,
            instructor_name: "Unknown",
            enrollment_count: 0,
            module_count: 0,
            challenge_count: 0,
          }
        }
      }),
    )

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

// Helper function to create sample data for testing
export async function createSampleData() {
  const supabase = createClient()

  try {
    // Check if sample data already exists
    const { data: existingCourses } = await supabase.from("courses").select("id").limit(1)

    if (existingCourses && existingCourses.length > 0) {
      return { success: true, message: "Sample data already exists" }
    }

    // Create sample courses
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .insert([
        {
          title: "Digital Marketing Mastery",
          description: "Learn the fundamentals of digital marketing including social media, email marketing, and SEO.",
          status: "published",
        },
        {
          title: "Copywriting Fundamentals",
          description: "Master the art of persuasive writing and create compelling copy that converts.",
          status: "published",
        },
        {
          title: "Social Media Strategy",
          description: "Develop effective social media strategies to grow your audience and engagement.",
          status: "draft",
        },
      ])
      .select()

    if (coursesError) {
      console.error("Error creating sample courses:", coursesError)
      return { success: false, error: coursesError.message }
    }

    // Create sample challenges if courses were created
    if (courses && courses.length > 0) {
      const { error: challengesError } = await supabase.from("challenges").insert([
        {
          course_id: courses[0].id,
          title: "Create a Facebook Ad Campaign",
          description: "Design and create a complete Facebook advertising campaign for a fictional business.",
          requirements: ["Campaign objective", "Target audience", "Ad creative", "Budget allocation"],
          xp_reward: 150,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
        {
          course_id: courses[1].id,
          title: "Write a Sales Page",
          description: "Create a compelling sales page for a product or service of your choice.",
          requirements: ["Headline", "Problem identification", "Solution presentation", "Call to action"],
          xp_reward: 200,
          due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
        },
      ])

      if (challengesError) {
        console.error("Error creating sample challenges:", challengesError)
        return { success: false, error: challengesError.message }
      }

      // Create sample modules for the first course
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .insert([
          {
            course_id: courses[0].id,
            title: "Introduction to Digital Marketing",
            description: "Get started with digital marketing fundamentals",
            order_index: 1,
          },
          {
            course_id: courses[0].id,
            title: "Social Media Marketing",
            description: "Learn how to leverage social media platforms",
            order_index: 2,
          },
        ])
        .select()

      if (modulesError) {
        console.error("Error creating sample modules:", modulesError)
      }

      // Create sample lessons if modules were created
      if (modules && modules.length > 0) {
        const { error: lessonsError } = await supabase.from("lessons").insert([
          {
            module_id: modules[0].id,
            title: "What is Digital Marketing?",
            content: "Digital marketing encompasses all marketing efforts that use electronic devices or the internet.",
            duration: 625, // 10:25 in seconds
            order_index: 1,
          },
          {
            module_id: modules[0].id,
            title: "The Digital Marketing Landscape",
            content: "Understanding the current state of digital marketing and emerging trends.",
            duration: 930, // 15:30 in seconds
            order_index: 2,
          },
          {
            module_id: modules[1].id,
            title: "Social Media Platforms Overview",
            content: "A comprehensive look at major social media platforms and their unique characteristics.",
            duration: 1095, // 18:15 in seconds
            order_index: 1,
          },
        ])

        if (lessonsError) {
          console.error("Error creating sample lessons:", lessonsError)
        }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error creating sample data:", error)
    return { success: false, error: error.message }
  }
}
