"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, ChevronLeft, ChevronRight, Download, FileText, Play, Video } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock course data
const courseData = {
  id: "1",
  title: "Digital Marketing Mastery",
  description: "Learn the fundamentals of digital marketing and how to create effective campaigns.",
  instructor: "Jane Smith",
  progress: 65,
  modules: [
    {
      id: "m1",
      title: "Introduction to Digital Marketing",
      completed: true,
      lessons: [
        {
          id: "l1",
          title: "What is Digital Marketing?",
          type: "video",
          duration: "10:25",
          completed: true,
        },
        {
          id: "l2",
          title: "The Digital Marketing Landscape",
          type: "video",
          duration: "15:30",
          completed: true,
        },
        {
          id: "l3",
          title: "Setting Your Marketing Goals",
          type: "video",
          duration: "12:45",
          completed: true,
        },
        {
          id: "l4",
          title: "Module 1 Quiz",
          type: "quiz",
          questions: 10,
          completed: true,
        },
      ],
    },
    {
      id: "m2",
      title: "Social Media Marketing",
      completed: true,
      lessons: [
        {
          id: "l5",
          title: "Social Media Platforms Overview",
          type: "video",
          duration: "18:15",
          completed: true,
        },
        {
          id: "l6",
          title: "Creating Engaging Content",
          type: "video",
          duration: "20:10",
          completed: true,
        },
        {
          id: "l7",
          title: "Social Media Strategy Template",
          type: "pdf",
          completed: true,
        },
        {
          id: "l8",
          title: "Module 2 Quiz",
          type: "quiz",
          questions: 8,
          completed: true,
        },
      ],
    },
    {
      id: "m3",
      title: "Email Marketing",
      completed: false,
      lessons: [
        {
          id: "l9",
          title: "Email Marketing Fundamentals",
          type: "video",
          duration: "14:20",
          completed: true,
        },
        {
          id: "l10",
          title: "Building Your Email List",
          type: "video",
          duration: "16:45",
          completed: true,
        },
        {
          id: "l11",
          title: "Email Marketing Strategies",
          type: "video",
          duration: "22:30",
          completed: false,
        },
        {
          id: "l12",
          title: "Email Templates",
          type: "pdf",
          completed: false,
        },
        {
          id: "l13",
          title: "Module 3 Quiz",
          type: "quiz",
          questions: 12,
          completed: false,
        },
      ],
    },
    {
      id: "m4",
      title: "Paid Advertising",
      completed: false,
      lessons: [
        {
          id: "l14",
          title: "Introduction to PPC",
          type: "video",
          duration: "15:10",
          completed: false,
        },
        {
          id: "l15",
          title: "Google Ads Fundamentals",
          type: "video",
          duration: "25:40",
          completed: false,
        },
        {
          id: "l16",
          title: "Facebook Ads",
          type: "video",
          duration: "20:15",
          completed: false,
        },
        {
          id: "l17",
          title: "Ad Campaign Worksheet",
          type: "pdf",
          completed: false,
        },
        {
          id: "l18",
          title: "Module 4 Quiz",
          type: "quiz",
          questions: 15,
          completed: false,
        },
      ],
    },
  ],
  challenges: [
    {
      id: "c1",
      title: "Create a Social Media Content Calendar",
      description: "Develop a 30-day content calendar for a business of your choice.",
      dueDate: "May 15, 2025",
      completed: true,
    },
    {
      id: "c2",
      title: "Create a Facebook Ad Campaign",
      description: "Design a Facebook ad campaign for a product or service.",
      dueDate: "May 20, 2025",
      completed: false,
    },
    {
      id: "c3",
      title: "Email Sequence Creation",
      description: "Create a 5-email sequence for a product launch.",
      dueDate: "May 28, 2025",
      completed: false,
    },
  ],
  resources: [
    {
      id: "r1",
      title: "Digital Marketing Glossary",
      type: "pdf",
    },
    {
      id: "r2",
      title: "Social Media Image Size Guide",
      type: "pdf",
    },
    {
      id: "r3",
      title: "Email Subject Line Swipe File",
      type: "pdf",
    },
    {
      id: "r4",
      title: "Ad Copy Templates",
      type: "pdf",
    },
  ],
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Find the first incomplete lesson
    for (const module of courseData.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed) {
          setActiveLesson(lesson.id)
          return
        }
      }
    }
    // If all lessons are completed, set the first lesson as active
    if (courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
      setActiveLesson(courseData.modules[0].lessons[0].id)
    }
  }, [])

  if (loading || !user) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Find the active lesson object
  let activeLessonObj = null
  let activeLessonModuleIndex = 0
  let activeLessonIndex = 0

  for (let i = 0; i < courseData.modules.length; i++) {
    const module = courseData.modules[i]
    for (let j = 0; j < module.lessons.length; j++) {
      const lesson = module.lessons[j]
      if (lesson.id === activeLesson) {
        activeLessonObj = lesson
        activeLessonModuleIndex = i
        activeLessonIndex = j
        break
      }
    }
    if (activeLessonObj) break
  }

  // Calculate next and previous lessons
  const getAdjacentLesson = (direction: "next" | "prev") => {
    if (!activeLessonObj) return null

    if (direction === "next") {
      // Check if there's another lesson in the current module
      if (activeLessonIndex < courseData.modules[activeLessonModuleIndex].lessons.length - 1) {
        return courseData.modules[activeLessonModuleIndex].lessons[activeLessonIndex + 1].id
      }
      // Check if there's another module
      if (activeLessonModuleIndex < courseData.modules.length - 1) {
        return courseData.modules[activeLessonModuleIndex + 1].lessons[0].id
      }
    } else {
      // Check if there's a previous lesson in the current module
      if (activeLessonIndex > 0) {
        return courseData.modules[activeLessonModuleIndex].lessons[activeLessonIndex - 1].id
      }
      // Check if there's a previous module
      if (activeLessonModuleIndex > 0) {
        const prevModule = courseData.modules[activeLessonModuleIndex - 1]
        return prevModule.lessons[prevModule.lessons.length - 1].id
      }
    }
    return null
  }

  const nextLessonId = getAdjacentLesson("next")
  const prevLessonId = getAdjacentLesson("prev")

  // Calculate total completed lessons
  const totalLessons = courseData.modules.reduce((acc, module) => acc + module.lessons.length, 0)
  const completedLessons = courseData.modules.reduce(
    (acc, module) => acc + module.lessons.filter((lesson) => lesson.completed).length,
    0,
  )
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{courseData.title}</h1>
            <p className="text-muted-foreground">Instructor: {courseData.instructor}</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              {activeLessonObj && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{activeLessonObj.title}</h2>
                    {activeLessonObj.type === "video" && <Badge variant="outline">{activeLessonObj.duration}</Badge>}
                  </div>

                  {activeLessonObj.type === "video" && (
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="icon" className="h-16 w-16 rounded-full">
                          <Play className="h-8 w-8" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeLessonObj.type === "quiz" && (
                    <div className="rounded-lg border p-6">
                      <h3 className="mb-4 text-lg font-medium">Quiz: {activeLessonObj.questions} Questions</h3>
                      <p className="mb-4 text-muted-foreground">
                        Test your knowledge of the material covered in this module.
                      </p>
                      <Button>Start Quiz</Button>
                    </div>
                  )}

                  {activeLessonObj.type === "pdf" && (
                    <div className="rounded-lg border p-6">
                      <h3 className="mb-4 text-lg font-medium">{activeLessonObj.title}</h3>
                      <p className="mb-4 text-muted-foreground">Download this resource to enhance your learning.</p>
                      <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => prevLessonId && setActiveLesson(prevLessonId)}
                      disabled={!prevLessonId}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => nextLessonId && setActiveLesson(nextLessonId)} disabled={!nextLessonId}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-4 pt-4">
              {courseData.modules.map((module, index) => (
                <Card key={module.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <span>
                        Module {index + 1}: {module.title}
                      </span>
                      {module.completed && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Button
                            variant={activeLesson === lesson.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveLesson(lesson.id)}
                          >
                            <div className="flex w-full items-center">
                              {lesson.type === "video" && <Video className="mr-2 h-4 w-4" />}
                              {lesson.type === "quiz" && <FileText className="mr-2 h-4 w-4" />}
                              {lesson.type === "pdf" && <Download className="mr-2 h-4 w-4" />}
                              <span className="flex-1 text-left">{lesson.title}</span>
                              {lesson.completed && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                              {lesson.type === "video" && (
                                <span className="ml-2 text-xs text-muted-foreground">{lesson.duration}</span>
                              )}
                            </div>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="challenges" className="space-y-4 pt-4">
              {courseData.challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      {challenge.title}
                      {challenge.completed && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                    </CardTitle>
                    <CardDescription>Due: {challenge.dueDate}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{challenge.description}</p>
                    <Button asChild>
                      <Link href={`/challenges/${challenge.id}`}>
                        {challenge.completed ? "View Submission" : "Start Challenge"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="resources" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Downloadable Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {courseData.resources.map((resource) => (
                      <li key={resource.id}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Download className="mr-2 h-4 w-4" />
                          {resource.title}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Course Completion</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} />
              </div>

              <div>
                <h3 className="mb-2 font-medium">Stats</h3>
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons Completed</span>
                    <span>
                      {completedLessons}/{totalLessons}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challenges Completed</span>
                    <span>
                      {courseData.challenges.filter((c) => c.completed).length}/{courseData.challenges.length}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Earned</span>
                    <span>650 XP</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Next Live Session</h3>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Q&A with Jane Smith</h4>
                  <p className="text-sm text-muted-foreground">May 18, 2025 • 2:00 PM</p>
                  <Button className="mt-4 w-full">Add to Calendar</Button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Community</h3>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/community/courses/1">Join Course Discussion</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
