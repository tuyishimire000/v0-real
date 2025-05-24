"use server"

import { createClient } from "@/utils/supabase/server"

export async function getCourses() {
  const supabase = createClient()

  try {
    // First, get basic course information
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error fetching courses:", coursesError)
      return { success: false, error: coursesError.message }
    }

    if (!courses || courses.length === 0) {
      return { success: true, courses: [] }
    }

    // Get additional data for each course separately to avoid RLS issues
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        try {
          // Get modules count
          const { count: modulesCount } = await supabase
            .from("modules")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id)

          // Get lessons count through modules
          const { data: modules } = await supabase.from("modules").select("id").eq("course_id", course.id)

          let lessonsCount = 0
          if (modules && modules.length > 0) {
            const moduleIds = modules.map((m) => m.id)
            const { count } = await supabase
              .from("lessons")
              .select("*", { count: "exact", head: true })
              .in("module_id", moduleIds)
            lessonsCount = count || 0
          }

          // Get challenges count
          const { count: challengesCount } = await supabase
            .from("challenges")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id)

          // Get enrollments count
          const { count: enrollmentsCount } = await supabase
            .from("course_enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id)

          return {
            ...course,
            totalLessons: lessonsCount,
            totalModules: modulesCount || 0,
            totalChallenges: challengesCount || 0,
            totalEnrollments: enrollmentsCount || 0,
          }
        } catch (error) {
          console.error(`Error fetching stats for course ${course.id}:`, error)
          return {
            ...course,
            totalLessons: 0,
            totalModules: 0,
            totalChallenges: 0,
            totalEnrollments: 0,
          }
        }
      }),
    )

    return { success: true, courses: coursesWithStats }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function enrollInCourse(courseId: string, userId: string) {
  const supabase = createClient()

  try {
    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .single()

    if (existingEnrollment) {
      return { success: false, error: "Already enrolled in this course" }
    }

    const { error } = await supabase.from("course_enrollments").insert({
      course_id: courseId,
      user_id: userId,
    })

    if (error) {
      console.error("Error enrolling in course:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserEnrollments(userId: string) {
  const supabase = createClient()

  try {
    const { data: enrollments, error } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching enrollments:", error)
      return { success: false, error: error.message }
    }

    return { success: true, enrollments: enrollments?.map((e) => e.course_id) || [] }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function getCourseById(courseId: string) {
  const supabase = createClient()

  try {
    // Get course details
    const { data: course, error: courseError } = await supabase.from("courses").select("*").eq("id", courseId).single()

    if (courseError) {
      console.error("Error fetching course:", courseError)
      return { success: false, error: courseError.message }
    }

    if (!course) {
      return { success: false, error: "Course not found" }
    }

    // Get modules with lessons
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })

    if (modulesError) {
      console.error("Error fetching modules:", modulesError)
    }

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      (modules || []).map(async (module) => {
        const { data: lessons } = await supabase
          .from("lessons")
          .select("*")
          .eq("module_id", module.id)
          .order("order_index", { ascending: true })

        return {
          ...module,
          lessons: lessons || [],
        }
      }),
    )

    // Get challenges
    const { data: challenges, error: challengesError } = await supabase
      .from("challenges")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true })

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError)
    }

    return {
      success: true,
      course: {
        ...course,
        modules: modulesWithLessons,
        challenges: challenges || [],
      },
    }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}
