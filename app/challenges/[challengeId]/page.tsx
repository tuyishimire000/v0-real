"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  Users,
  FileUp,
  ImageIcon,
  Send,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
} from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  getChallengeById,
  submitChallenge,
  updateSubmission,
  reviewSubmission,
  addSubmissionComment,
} from "@/app/actions/challenges"

export default function ChallengePage({ params }: { params: { challengeId: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchChallenge = async () => {
      setLoading(true)
      const result = await getChallengeById(params.challengeId, user.id)

      if (result.success) {
        setChallenge(result.challenge)
        if (result.challenge.userSubmission) {
          setSubmission(result.challenge.userSubmission.content || "")
          setActiveTab("submission")
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load challenge",
          variant: "destructive",
        })
      }

      setLoading(false)
    }

    fetchChallenge()
  }, [params.challengeId, user, router, toast])

  const handleSubmit = async () => {
    if (!submission.trim()) {
      toast({
        title: "Error",
        description: "Please provide your submission content",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      let result
      if (challenge.userSubmission) {
        result = await updateSubmission(challenge.userSubmission.id, submission)
      } else {
        result = await submitChallenge(params.challengeId, user!.id, submission)
      }

      if (result.success) {
        toast({
          title: "Success!",
          description: challenge.userSubmission ? "Submission updated" : "Challenge submitted successfully",
        })

        // Refresh challenge data
        const updatedResult = await getChallengeById(params.challengeId, user!.id)
        if (updatedResult.success) {
          setChallenge(updatedResult.challenge)
          setActiveTab("feedback")
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit challenge",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }

    setSubmitting(false)
  }

  const handleReview = async (
    submissionId: string,
    status: "approved" | "rejected",
    feedback: string,
    grade?: number,
  ) => {
    const result = await reviewSubmission(submissionId, user!.id, status, feedback, grade)

    if (result.success) {
      toast({
        title: "Review submitted",
        description: "Your review has been recorded",
      })

      // Refresh data
      const updatedResult = await getChallengeById(params.challengeId, user!.id)
      if (updatedResult.success) {
        setChallenge(updatedResult.challenge)
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const handleComment = async () => {
    if (!comment.trim() || !challenge.userSubmission) return

    const result = await addSubmissionComment(challenge.userSubmission.id, user!.id, comment)

    if (result.success) {
      setComment("")
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      })

      // Refresh data
      const updatedResult = await getChallengeById(params.challengeId, user!.id)
      if (updatedResult.success) {
        setChallenge(updatedResult.challenge)
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading challenge...</div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Challenge not found</h1>
          <Button className="mt-4" asChild>
            <Link href="/challenges">Back to Challenges</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isExpired = new Date(challenge.due_date) <= new Date()
  const canSubmit = !isExpired && (!challenge.userSubmission || challenge.userSubmission.status === "rejected")
  const isMentor = user?.role === "mentor" || user?.role === "admin"

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Expired"
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    return `Due in ${diffDays} days`
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/challenges">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Challenges
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{challenge.title}</h1>
              <div className="flex items-center gap-2">
                {challenge.userSubmission ? (
                  challenge.userSubmission.status === "approved" ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  ) : challenge.userSubmission.status === "submitted" ? (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Under Review
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Needs Revision
                    </Badge>
                  )
                ) : isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="outline">Available</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDueDate(challenge.due_date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{challenge.xp_reward} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{challenge.totalSubmissions} submissions</span>
              </div>
            </div>
            <p className="text-muted-foreground">Course: {challenge.course.title}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Challenge Details</TabsTrigger>
              <TabsTrigger value="submission">Your Submission</TabsTrigger>
              <TabsTrigger value="feedback">Feedback & Review</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{challenge.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="ml-6 list-disc space-y-2">
                    {challenge.requirements?.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {challenge.rubric && (
                <Card>
                  <CardHeader>
                    <CardTitle>Grading Rubric</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(challenge.rubric).map(([criteria, weight]) => (
                        <div key={criteria} className="flex justify-between">
                          <span>{criteria}</span>
                          <span>{weight}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="submission" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Work</CardTitle>
                  <CardDescription>
                    Provide a detailed description of your work and upload any relevant files.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe your work in detail..."
                    className="min-h-[200px]"
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    disabled={!canSubmit}
                  />
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Button variant="outline" className="flex-1" disabled={!canSubmit}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                    <Button variant="outline" className="flex-1" disabled={!canSubmit}>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                  {canSubmit && (
                    <Button className="w-full" onClick={handleSubmit} disabled={submitting || !submission.trim()}>
                      {submitting
                        ? "Submitting..."
                        : challenge.userSubmission
                          ? "Update Submission"
                          : "Submit Challenge"}
                    </Button>
                  )}
                  {!canSubmit && challenge.userSubmission && (
                    <p className="text-sm text-muted-foreground">
                      {isExpired ? "Challenge has expired" : "Submission is under review"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  {challenge.userSubmission?.feedback ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Mentor Feedback</h4>
                        <p className="whitespace-pre-wrap">{challenge.userSubmission.feedback}</p>
                        {challenge.userSubmission.grade && (
                          <div className="mt-2 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>Grade: {challenge.userSubmission.grade}/100</span>
                          </div>
                        )}
                      </div>
                      {challenge.userSubmission.reviewer && (
                        <p className="text-sm text-muted-foreground">
                          Reviewed by {challenge.userSubmission.reviewer.name} on{" "}
                          {new Date(challenge.userSubmission.reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : challenge.userSubmission ? (
                    <p className="text-muted-foreground">
                      Your submission is under review. Feedback will appear here once available.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Submit your work to receive feedback from mentors.</p>
                  )}
                </CardContent>
              </Card>

              {/* Comment Section */}
              {challenge.userSubmission && (
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={user?.avatar_url || ""} alt={user?.name || user?.email} />
                        <AvatarFallback>{user?.name?.charAt(0) || user?.email.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add a comment or question..."
                          className="min-h-[80px]"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <Button className="mt-2" onClick={handleComment} disabled={!comment.trim()}>
                          <Send className="mr-2 h-4 w-4" />
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="community" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Community Submissions</CardTitle>
                  <CardDescription>View approved submissions from other students for inspiration</CardDescription>
                </CardHeader>
                <CardContent>
                  {challenge.otherSubmissions?.length > 0 ? (
                    <div className="space-y-4">
                      {challenge.otherSubmissions.map((submission: any) => (
                        <div key={submission.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">Anonymous Student</span>
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          </div>
                          <p className="text-sm line-clamp-3">{submission.content}</p>
                          {submission.grade && (
                            <div className="mt-2 flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>Grade: {submission.grade}/100</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No approved submissions yet. Be the first to complete this challenge!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
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
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{new Date(challenge.due_date).toLocaleDateString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Remaining</span>
                    <span>{formatDueDate(challenge.due_date)}</span>
                  </div>
                  {challenge.userSubmission && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted</span>
                        <span>{new Date(challenge.userSubmission.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Rewards</h3>
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP</span>
                    <span>{challenge.xp_reward} XP</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Badge</span>
                    <span>Challenge Completer</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Need Help?</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/community/challenges/${challenge.id}`}>
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
