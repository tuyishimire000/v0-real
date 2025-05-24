"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Users, Star, Trophy } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

// This would normally come from your server action
async function getCourseDetails(courseId: string) {
  // Mock data for now - replace with actual server action
  return {
    success: true,
    course: {
      id: courseId,
      title: "Digital Marketing Mastery",
      description:
        "Master the fundamentals of digital marketing including social media, email marketing, SEO, and paid advertising. Learn proven strategies to grow your business online.",
      instructor: "Jane Smith",
      rating: 4.8,
      totalStudents: 1245,
      totalLessons: 45,
      totalDuration: "8 hours",
      modules: [
        {
          id: "m1",
          title: "Introduction to Digital Marketing",
          lessons: [
            { id: "l1", title: "What is Digital Marketing?", duration: "10:25", completed: false },
            { id: "l2", title: "The Digital Marketing Landscape", duration: "15:30", completed: false },
            { id: "l3", title: "Setting Your Marketing Goals", duration: "12:45", completed: false },
          ],
        },
        {
          id: "m2",
          title: "Social Media Marketing",
          lessons: [
            { id: "l4", title: "Social Media Platforms Overview", duration: "18:15", completed: false },
            { id: "l5", title: "Creating Engaging Content", duration: "20:10", completed: false },
          ],
        },
      ],
      challenges: [
        {
          id: "c1",
          title: "Create a Social Media Content Calendar",
          description: "Develop a 30-day content calendar for a business of your choice.",
          dueDate: "May 30, 2025",
        },
      ],
    },
  }
}

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      const result = await getCourseDetails(params.courseId)

      if (result.success) {
        setCourse(result.course)
        // Check if user is enrolled (mock for now)
        setIsEnrolled(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        })
      }

      setLoading(false)
    }

    fetchCourse()
  }, [params.courseId, toast])

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading course...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Button className="mt-4" asChild>
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const completedLessons = course.modules.reduce(
    (acc: number, module: any) => acc + module.lessons.filter((lesson: any) => lesson.completed).length,
    0,
  )
  const progressPercentage = Math.round((completedLessons / course.totalLessons) * 100)

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{course.totalStudents.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{course.rating} rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{course.totalDuration} total</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="curriculum" className="space-y-6">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="space-y-4">
              {course.modules.map((module: any, moduleIndex: number) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>
                        Module {moduleIndex + 1}: {module.title}
                      </span>
                      {module.lessons.every((lesson: any) => lesson.completed) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                              {lesson.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </div>
                          {isEnrolled && (
                            <Button variant="ghost" size="sm">
                              {lesson.completed ? "Review" : "Start"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              {course.challenges.map((challenge: any) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      {challenge.title}
                    </CardTitle>
                    <CardDescription>Due: {challenge.dueDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{challenge.description}</p>
                    {isEnrolled && <Button>Start Challenge</Button>}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="instructor" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{course.instructor}</CardTitle>
                  <CardDescription>Digital Marketing Expert</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Jane Smith is a digital marketing expert with over 10 years of experience helping businesses grow
                    their online presence. She has worked with companies ranging from startups to Fortune 500 companies
                    and has generated millions in revenue through digital marketing campaigns.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEnrolled ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} />
                    <p className="text-xs text-muted-foreground">
                      {completedLessons} of {course.totalLessons} lessons completed
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Button className="w-full" asChild>
                      <Link href={`/courses/${course.id}/learn`}>Continue Learning</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/community/courses/${course.id}`}>Join Discussion</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Ready to start learning?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enroll now to access all course content and challenges
                    </p>
                  </div>

                  {user ? (
                    <Button className="w-full">Enroll Now</Button>
                  ) : (
                    <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <Link href="/register">Sign Up to Enroll</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/login">Log In</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">What you'll learn:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Digital marketing fundamentals</li>
                  <li>• Social media strategy</li>
                  <li>• Email marketing automation</li>
                  <li>• Paid advertising campaigns</li>
                  <li>• Analytics and optimization</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
