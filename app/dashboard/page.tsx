"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Calendar, CheckCircle, Clock, Trophy, Users } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // This will never render because of the redirect in useEffect
  }

  // Mock data for the dashboard
  const enrolledCourses = [
    {
      id: 1,
      title: "Digital Marketing Mastery",
      progress: 65,
      nextLesson: "Email Marketing Strategies",
      instructor: "Jane Smith",
    },
    {
      id: 2,
      title: "Copywriting Fundamentals",
      progress: 30,
      nextLesson: "Writing Compelling Headlines",
      instructor: "John Doe",
    },
  ]

  const upcomingChallenges = [
    {
      id: 1,
      title: "Create a Facebook Ad Campaign",
      dueDate: "May 20, 2025",
      course: "Digital Marketing Mastery",
    },
    {
      id: 2,
      title: "Write a Sales Page",
      dueDate: "May 25, 2025",
      course: "Copywriting Fundamentals",
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Q&A Session with Marketing Expert",
      date: "May 18, 2025",
      time: "2:00 PM - 3:30 PM",
      type: "Zoom Call",
    },
    {
      id: 2,
      title: "Copywriting Workshop",
      date: "May 22, 2025",
      time: "1:00 PM - 3:00 PM",
      type: "YouTube Live",
    },
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name || user.email.split("@")[0]}</h1>
          <p className="text-muted-foreground">Here's an overview of your learning journey</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.level}</div>
              <p className="text-xs text-muted-foreground">{1000 - (user.xp % 1000)} XP until next level</p>
              <Progress className="mt-2" value={(user.xp % 1000) / 10} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Enrolled in 2 courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Challenges</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Completed 7 challenges</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Forum contributions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {enrolledCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>Instructor: {course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Next: {course.nextLesson}</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>Continue Learning</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/courses">Browse All Courses</Link>
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="challenges" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>Course: {challenge.course}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {challenge.dueDate}</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/challenges/${challenge.id}`}>View Challenge</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/challenges">View All Challenges</Link>
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="events" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{event.type}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.date}, {event.time}
                      </span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/events/${event.id}`}>Join Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
