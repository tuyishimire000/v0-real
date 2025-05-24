"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Users, TrendingUp, Award } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getAdminStats, getRecentUsers, getRecentEnrollments, getRecentSubmissions } from "@/app/actions/admin"

type AdminStats = {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalSubmissions: number
  completionRate: number
  activeUsers: number
  monthlyGrowth: number
}

type RecentUser = {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  xp: number
  level: number
}

type RecentEnrollment = {
  id: string
  user_name: string
  course_title: string
  enrolled_at: string
}

type RecentSubmission = {
  id: string
  user_name: string
  challenge_title: string
  status: string
  submitted_at: string
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    setLoadingData(true)
    try {
      const [statsResult, usersResult, enrollmentsResult, submissionsResult] = await Promise.all([
        getAdminStats(),
        getRecentUsers(),
        getRecentEnrollments(),
        getRecentSubmissions(),
      ])

      if (statsResult.success) setStats(statsResult.stats)
      if (usersResult.success) setRecentUsers(usersResult.users)
      if (enrollmentsResult.success) setRecentEnrollments(enrollmentsResult.enrollments)
      if (submissionsResult.success) setRecentSubmissions(submissionsResult.submissions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You do not have permission to access this page.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/users">Manage Users</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/courses">Manage Courses</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/settings">Platform Settings</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+{stats?.monthlyGrowth || 0}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">Published courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Average course completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Key metrics for the learning platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Enrollments</span>
                  <span className="font-medium">{stats?.totalEnrollments || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Submissions</span>
                  <span className="font-medium">{stats?.totalSubmissions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">{stats?.completionRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Growth</span>
                  <span className="font-medium text-green-600">+{stats?.monthlyGrowth || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/admin/courses/new">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Create New Course
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/challenges/new">
                    <Award className="mr-2 h-4 w-4" />
                    Create New Challenge
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Registrations</CardTitle>
              <CardDescription>New users who joined in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 text-sm font-medium text-muted-foreground">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Level</div>
                  <div>XP</div>
                  <div>Joined</div>
                </div>
                {recentUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-6 items-center text-sm">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                    <div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </div>
                    <div>{user.level}</div>
                    <div>{user.xp}</div>
                    <div className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No recent users</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Course Enrollments</CardTitle>
              <CardDescription>Latest course enrollments on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground">
                  <div>Student</div>
                  <div>Course</div>
                  <div>Enrolled</div>
                </div>
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="grid grid-cols-3 items-center text-sm">
                    <div className="font-medium">{enrollment.user_name}</div>
                    <div>{enrollment.course_title}</div>
                    <div className="text-muted-foreground">{new Date(enrollment.enrolled_at).toLocaleDateString()}</div>
                  </div>
                ))}
                {recentEnrollments.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No recent enrollments</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Challenge Submissions</CardTitle>
              <CardDescription>Latest challenge submissions requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                  <div>Student</div>
                  <div>Challenge</div>
                  <div>Status</div>
                  <div>Submitted</div>
                </div>
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="grid grid-cols-4 items-center text-sm">
                    <div className="font-medium">{submission.user_name}</div>
                    <div>{submission.challenge_title}</div>
                    <div>
                      <Badge
                        variant={
                          submission.status === "approved"
                            ? "default"
                            : submission.status === "submitted"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {recentSubmissions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No recent submissions</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
