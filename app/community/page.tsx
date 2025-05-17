"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageSquare, Search, Users } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Mock forum data
const forumData = {
  categories: [
    {
      id: "general",
      name: "General Discussion",
      description: "General topics related to the platform and learning",
      topics: 156,
      posts: 1243,
    },
    {
      id: "introductions",
      name: "Introductions",
      description: "Introduce yourself to the community",
      topics: 324,
      posts: 1876,
    },
    {
      id: "success-stories",
      name: "Success Stories",
      description: "Share your wins and achievements",
      topics: 98,
      posts: 542,
    },
  ],
  courses: [
    {
      id: "1",
      name: "Digital Marketing Mastery",
      description: "Discuss topics related to digital marketing",
      topics: 87,
      posts: 456,
    },
    {
      id: "2",
      name: "Copywriting Fundamentals",
      description: "Discuss copywriting techniques and strategies",
      topics: 64,
      posts: 321,
    },
  ],
  recentTopics: [
    {
      id: "t1",
      title: "How to improve Facebook ad conversion rates?",
      category: "Digital Marketing Mastery",
      author: {
        name: "John Smith",
        avatar: "/placeholder.svg?height=40&width=40",
        level: 12,
      },
      replies: 24,
      views: 156,
      lastActivity: "2 hours ago",
    },
    {
      id: "t2",
      title: "My journey from beginner to pro copywriter",
      category: "Success Stories",
      author: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        level: 8,
      },
      replies: 18,
      views: 203,
      lastActivity: "5 hours ago",
    },
    {
      id: "t3",
      title: "Email subject lines that get 80%+ open rates",
      category: "Copywriting Fundamentals",
      author: {
        name: "Mike Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        level: 15,
      },
      replies: 32,
      views: 278,
      lastActivity: "1 day ago",
    },
    {
      id: "t4",
      title: "Hello from Australia! New member here",
      category: "Introductions",
      author: {
        name: "Emma Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        level: 3,
      },
      replies: 12,
      views: 89,
      lastActivity: "2 days ago",
    },
  ],
  activeUsers: [
    {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 12,
      role: "student",
      posts: 87,
    },
    {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 8,
      role: "student",
      posts: 64,
    },
    {
      name: "Mike Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 15,
      role: "mentor",
      posts: 156,
    },
    {
      name: "Emma Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 3,
      role: "student",
      posts: 23,
    },
    {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      level: 20,
      role: "mentor",
      posts: 243,
    },
  ],
}

export default function CommunityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">Connect with fellow learners and mentors</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search topics..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Topic
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="categories" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="courses">Course Forums</TabsTrigger>
              <TabsTrigger value="recent">Recent Topics</TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="space-y-4">
              {forumData.categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-2">
                    <Link href={`/community/${category.id}`}>
                      <CardTitle className="text-xl hover:underline">{category.name}</CardTitle>
                    </Link>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      <span>{category.topics} topics</span>
                      <span>{category.posts} posts</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="courses" className="space-y-4">
              {forumData.courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-2">
                    <Link href={`/community/courses/${course.id}`}>
                      <CardTitle className="text-xl hover:underline">{course.name}</CardTitle>
                    </Link>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      <span>{course.topics} topics</span>
                      <span>{course.posts} posts</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="recent" className="space-y-4">
              {forumData.recentTopics.map((topic) => (
                <Card key={topic.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/community/topics/${topic.id}`}>
                          <CardTitle className="text-lg hover:underline">{topic.title}</CardTitle>
                        </Link>
                        <CardDescription>in {topic.category}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={topic.author.avatar || "/placeholder.svg"} alt={topic.author.name} />
                          <AvatarFallback>{topic.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <div className="font-medium">{topic.author.name}</div>
                          <div className="text-muted-foreground">Level {topic.author.level}</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex gap-4">
                      <span>{topic.replies} replies</span>
                      <span>{topic.views} views</span>
                    </div>
                    <div>Last activity: {topic.lastActivity}</div>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {forumData.activeUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Level {user.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{user.role}</span>
                      <span>•</span>
                      <span>{user.posts} posts</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Members
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Members</span>
                <span>1,245</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Topics</span>
                <span>729</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Posts</span>
                <span>4,438</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Today</span>
                <span>87</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                Our community is built on respect, collaboration, and growth. Please follow these guidelines:
              </p>
              <ul className="ml-6 list-disc text-sm">
                <li>Be respectful and supportive</li>
                <li>Stay on topic in discussions</li>
                <li>No self-promotion without permission</li>
                <li>Share knowledge and help others</li>
                <li>Report inappropriate content</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/community/guidelines">Read Full Guidelines</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
