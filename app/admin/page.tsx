"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, DollarSign, FileText, Users } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (user.role !== "admin") {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">2 courses added this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$21,500</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Registrations</CardTitle>
                <CardDescription>New users who joined in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Joined</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>John Smith</div>
                    <div>john@example.com</div>
                    <div>Student</div>
                    <div>2 days ago</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Sarah Johnson</div>
                    <div>sarah@example.com</div>
                    <div>Student</div>
                    <div>3 days ago</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Michael Brown</div>
                    <div>michael@example.com</div>
                    <div>Mentor</div>
                    <div>1 week ago</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Emma Wilson</div>
                    <div>emma@example.com</div>
                    <div>Student</div>
                    <div>1 week ago</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>David Lee</div>
                    <div>david@example.com</div>
                    <div>Student</div>
                    <div>2 weeks ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Enrollment and completion rates for active courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                    <div>Course</div>
                    <div>Enrollments</div>
                    <div>Completion Rate</div>
                    <div>Avg. Rating</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Digital Marketing Mastery</div>
                    <div>342</div>
                    <div>68%</div>
                    <div>4.8/5</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Copywriting Fundamentals</div>
                    <div>256</div>
                    <div>72%</div>
                    <div>4.7/5</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Social Media Strategy</div>
                    <div>189</div>
                    <div>65%</div>
                    <div>4.6/5</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Email Marketing</div>
                    <div>145</div>
                    <div>58%</div>
                    <div>4.5/5</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>SEO Fundamentals</div>
                    <div>132</div>
                    <div>62%</div>
                    <div>4.7/5</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest transactions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                    <div>User</div>
                    <div>Amount</div>
                    <div>Method</div>
                    <div>Date</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>John Smith</div>
                    <div>$99.00</div>
                    <div>Credit Card</div>
                    <div>Today</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Sarah Johnson</div>
                    <div>$99.00</div>
                    <div>PayPal</div>
                    <div>Yesterday</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Michael Brown</div>
                    <div>$299.00</div>
                    <div>Credit Card</div>
                    <div>2 days ago</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>Emma Wilson</div>
                    <div>$99.00</div>
                    <div>Mobile Money</div>
                    <div>3 days ago</div>
                  </div>
                  <div className="grid grid-cols-4 items-center text-sm">
                    <div>David Lee</div>
                    <div>$299.00</div>
                    <div>Credit Card</div>
                    <div>1 week ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
