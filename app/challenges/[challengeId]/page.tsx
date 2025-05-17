"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Clock, FileUp, ImageIcon, MessageSquare, Send } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Mock challenge data
const challengeData = {
  id: "c2",
  title: "Create a Facebook Ad Campaign",
  description:
    "Design a Facebook ad campaign for a product or service of your choice. Include the target audience, ad copy, visuals, and budget allocation. Submit your campaign plan and mockups.",
  dueDate: "May 20, 2025",
  course: {
    id: "1",
    title: "Digital Marketing Mastery",
  },
  requirements: [
    "Choose a real or fictional product/service",
    "Define your target audience with demographics and interests",
    "Create compelling ad copy (headline, description, CTA)",
    "Design or select appropriate visuals",
    "Set a budget and explain your allocation strategy",
    "Explain your expected results and KPIs",
  ],
  rubric: [
    {
      criteria: "Target Audience Definition",
      weight: 20,
    },
    {
      criteria: "Ad Copy Quality",
      weight: 25,
    },
    {
      criteria: "Visual Design",
      weight: 25,
    },
    {
      criteria: "Budget Strategy",
      weight: 15,
    },
    {
      criteria: "Expected Results & KPIs",
      weight: 15,
    },
  ],
  status: "in-progress", // in-progress, submitted, reviewed
  feedback: null,
  comments: [
    {
      id: "comment1",
      user: {
        name: "Jane Smith",
        role: "mentor",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      text: "Remember to focus on a specific audience segment rather than trying to target everyone!",
      timestamp: "2 days ago",
    },
  ],
}

export default function ChallengePage({ params }: { params: { challengeId: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [submission, setSubmission] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

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

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitting(false)
    setActiveTab("feedback")
    // In a real app, you would submit to your backend
  }

  const handleComment = () => {
    if (!comment.trim()) return
    // In a real app, you would submit to your backend
    setComment("")
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link
          href={`/courses/${challengeData.course.id}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to {challengeData.course.title}
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{challengeData.title}</h1>
              <Badge variant={challengeData.status === "in-progress" ? "outline" : "default"}>
                {challengeData.status === "in-progress"
                  ? "In Progress"
                  : challengeData.status === "submitted"
                    ? "Submitted"
                    : "Reviewed"}
              </Badge>
            </div>
            <div className="mt-2 flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              Due: {challengeData.dueDate}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Challenge Details</TabsTrigger>
              <TabsTrigger value="submission">Your Submission</TabsTrigger>
              <TabsTrigger value="feedback">Feedback & Comments</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{challengeData.description}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="ml-6 list-disc space-y-2">
                    {challengeData.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Grading Rubric</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {challengeData.rubric.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.criteria}</span>
                        <span>{item.weight}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="submission" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Work</CardTitle>
                  <CardDescription>
                    Provide a detailed description of your Facebook ad campaign and upload any relevant files.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe your Facebook ad campaign in detail..."
                    className="min-h-[200px]"
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                  />
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Button variant="outline" className="flex-1">
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                  <Button className="w-full" onClick={handleSubmit} disabled={submitting || !submission.trim()}>
                    {submitting ? "Submitting..." : "Submit Challenge"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  {challengeData.feedback ? (
                    <div className="space-y-4">
                      <p>{challengeData.feedback}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Your submission will be reviewed by a mentor. Feedback will appear here once available.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {challengeData.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.user.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <p>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || ""} alt={user.name || user.email} />
                      <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Textarea
                          placeholder="Add a comment..."
                          className="min-h-[80px]"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleComment} disabled={!comment.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Post Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Challenge Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-medium">Timeline</h3>
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned</span>
                    <span>May 10, 2025</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{challengeData.dueDate}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Remaining</span>
                    <span>3 days</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Rewards</h3>
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP</span>
                    <span>250 XP</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Badge</span>
                    <span>Facebook Ads Specialist</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Need Help?</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/community/challenges/c2">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discuss with Peers
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Mentor Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
