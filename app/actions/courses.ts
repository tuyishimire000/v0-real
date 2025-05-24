"use server"

import { createClient } from "@/utils/supabase/server"

export async function getCourses() {
  const supabase = createClient()

  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        *,
        modules:modules(
          id,
          title,
          lessons:lessons(id)
        ),
        challenges:challenges(id),
        enrollments:course_enrollments(id)
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching courses:", error)
      return { success: false, error: error.message }
    }

    // Calculate course statistics
    const coursesWithStats =
      courses?.map((course) => ({
        ...course,
        totalLessons: course.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0,
        totalModules: course.modules?.length || 0,
        totalChallenges: course.challenges?.length || 0,
        totalEnrollments: course.enrollments?.length || 0,
      })) || []

    return { success: true, courses: coursesWithStats }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

export async function enrollInCourse(courseId: string, userId: string) {
  const supabase = createClient()

  try {
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
