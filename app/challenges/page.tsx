"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Trophy, Users, Search, CheckCircle, AlertCircle } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getChallenges } from "@/app/actions/challenges"

type Challenge = {
  id: string
  title: string
  description: string
  due_date: string
  xp_reward: number
  course: { id: string; title: string }
  userSubmission?: any
  totalSubmissions: number
}

export default function ChallengesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchChallenges = async () => {
      setLoading(true)
      const result = await getChallenges(user.id)

      if (result.success) {
        setChallenges(result.challenges || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load challenges",
          variant: "destructive",
        })
      }

      setLoading(false)
    }

    fetchChallenges()
  }, [user, router, toast])

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">Loading challenges...</div>
      </div>
    )
  }

  // Filter challenges
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && challenge.userSubmission?.status === "approved") ||
      (statusFilter === "submitted" && challenge.userSubmission?.status === "submitted") ||
      (statusFilter === "pending" && !challenge.userSubmission)

    const matchesCourse = courseFilter === "all" || challenge.course.title === courseFilter

    return matchesSearch && matchesStatus && matchesCourse
  })

  // Categorize challenges
  const activeChallenges = filteredChallenges.filter((c) => new Date(c.due_date) > new Date() && !c.userSubmission)
  const submittedChallenges = filteredChallenges.filter(
    (c) => c.userSubmission && c.userSubmission.status !== "approved",
  )
  const completedChallenges = filteredChallenges.filter((c) => c.userSubmission?.status === "approved")
  const expiredChallenges = filteredChallenges.filter((c) => new Date(c.due_date) <= new Date() && !c.userSubmission)

  const getStatusBadge = (challenge: Challenge) => {
    if (challenge.userSubmission) {
      switch (challenge.userSubmission.status) {
        case "approved":
          return (
            <Badge className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )
        case "submitted":
          return (
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              Under Review
            </Badge>
          )
        case "rejected":
          return (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Needs Revision
            </Badge>
          )
        default:
          return <Badge variant="secondary">Submitted</Badge>
      }
    }

    const isExpired = new Date(challenge.due_date) <= new Date()
    return isExpired ? <Badge variant="destructive">Expired</Badge> : <Badge variant="outline">Available</Badge>
  }

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

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card key={challenge.id} className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{challenge.title}</CardTitle>
            <CardDescription className="mt-1">{challenge.course.title}</CardDescription>
          </div>
          {getStatusBadge(challenge)}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{challenge.description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDueDate(challenge.due_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>{challenge.xp_reward} XP</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.totalSubmissions} submissions</span>
            </div>
            <span className="text-muted-foreground">{new Date(challenge.due_date).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/challenges/${challenge.id}`}>
            {challenge.userSubmission ? "View Submission" : "Start Challenge"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Challenges</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Apply your skills with real-world challenges and build your portfolio
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Available</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {Array.from(new Set(challenges.map((c) => c.course.title))).map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Challenge Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedChallenges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredChallenges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active challenges</h3>
              <p className="text-muted-foreground">Check back later for new challenges</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-6">
          {submittedChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submitted challenges</h3>
              <p className="text-muted-foreground">Your submitted challenges will appear here</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {submittedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedChallenges.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No completed challenges</h3>
              <p className="text-muted-foreground">Complete challenges to build your portfolio</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          {expiredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expired challenges</h3>
              <p className="text-muted-foreground">Expired challenges will appear here</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {expiredChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
