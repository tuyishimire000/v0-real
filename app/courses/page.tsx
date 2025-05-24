"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Clock, Star, Users, Search, Filter } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getCourses, enrollInCourse, getUserEnrollments } from "@/app/actions/courses"

type Course = {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  updated_at: string
  totalLessons: number
  totalModules: number
  totalChallenges: number
  totalEnrollments: number
}

export default function CoursesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch courses
      const coursesResult = await getCourses()
      if (coursesResult.success) {
        setCourses(coursesResult.courses || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        })
      }

      // Fetch user enrollments if logged in
      if (user) {
        const enrollmentsResult = await getUserEnrollments(user.id)
        if (enrollmentsResult.success) {
          setEnrolledCourses(enrollmentsResult.enrollments || [])
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [user, toast])

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to enroll in courses",
        variant: "destructive",
      })
      return
    }

    setEnrolling(courseId)
    const result = await enrollInCourse(courseId, user.id)

    if (result.success) {
      setEnrolledCourses((prev) => [...prev, courseId])
      toast({
        title: "Enrolled successfully!",
        description: "You can now access the course content",
      })
    } else {
      toast({
        title: "Enrollment failed",
        description: result.error || "Something went wrong",
        variant: "destructive",
      })
    }

    setEnrolling(null)
  }

  // Filter and sort courses
  const filteredCourses = courses
    .filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "popular":
          return b.totalEnrollments - a.totalEnrollments
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading courses...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Courses</h1>
        <p className="text-xl text-muted-foreground mt-2">Master real-world skills with our expert-led courses</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "No courses are available at the moment"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course.id)
            const isEnrolling = enrolling === course.id

            return (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{course.totalModules} modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{course.totalEnrollments} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {course.totalChallenges > 0 && (
                      <Badge variant="secondary" className="w-fit">
                        {course.totalChallenges} challenges
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {isEnrolled ? (
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>Continue Learning</Link>
                    </Button>
                  ) : (
                    <Button onClick={() => handleEnroll(course.id)} disabled={isEnrolling} className="w-full">
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Call to Action */}
      {!user && (
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to Start Learning?</CardTitle>
              <CardDescription>Create an account to enroll in courses and track your progress</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-4">
              <Button asChild className="flex-1">
                <Link href="/register">Sign Up</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/login">Log In</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
