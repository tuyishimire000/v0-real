"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Filter, Search, Video } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock events data
const eventsData = {
  upcoming: [
    {
      id: "e1",
      title: "Q&A Session with Marketing Expert",
      description:
        "Join our live Q&A session with marketing expert Jane Smith to get answers to your most pressing digital marketing questions.",
      date: "May 18, 2025",
      time: "2:00 PM - 3:30 PM",
      type: "Zoom Call",
      host: "Jane Smith",
      course: "Digital Marketing Mastery",
      registered: true,
    },
    {
      id: "e2",
      title: "Copywriting Workshop",
      description:
        "Learn how to write compelling copy that converts in this hands-on workshop with professional copywriter John Doe.",
      date: "May 22, 2025",
      time: "1:00 PM - 3:00 PM",
      type: "YouTube Live",
      host: "John Doe",
      course: "Copywriting Fundamentals",
      registered: false,
    },
    {
      id: "e3",
      title: "Social Media Strategy Masterclass",
      description: "Discover the latest social media strategies and tactics to grow your audience and engagement.",
      date: "May 25, 2025",
      time: "11:00 AM - 12:30 PM",
      type: "Zoom Call",
      host: "Sarah Johnson",
      course: "Digital Marketing Mastery",
      registered: false,
    },
    {
      id: "e4",
      title: "Email Marketing Automation Demo",
      description:
        "See how to set up effective email marketing automation sequences that nurture leads and drive sales.",
      date: "May 30, 2025",
      time: "2:00 PM - 3:00 PM",
      type: "Zoom Call",
      host: "Mike Wilson",
      course: "Digital Marketing Mastery",
      registered: false,
    },
  ],
  replays: [
    {
      id: "r1",
      title: "Introduction to Digital Marketing",
      description: "An overview of digital marketing channels and strategies for beginners.",
      date: "May 5, 2025",
      duration: "1 hour 15 minutes",
      type: "Recorded Webinar",
      host: "Jane Smith",
      course: "Digital Marketing Mastery",
      views: 342,
    },
    {
      id: "r2",
      title: "Headline Writing Techniques",
      description: "Learn proven techniques for writing headlines that grab attention and drive clicks.",
      date: "May 8, 2025",
      duration: "45 minutes",
      type: "Recorded Workshop",
      host: "John Doe",
      course: "Copywriting Fundamentals",
      views: 256,
    },
    {
      id: "r3",
      title: "Facebook Ads Masterclass",
      description: "A comprehensive guide to creating effective Facebook ad campaigns.",
      date: "May 10, 2025",
      duration: "1 hour 30 minutes",
      type: "Recorded Webinar",
      host: "Sarah Johnson",
      course: "Digital Marketing Mastery",
      views: 189,
    },
  ],
}

export default function EventsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")

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

  // Filter events based on search query and course filter
  const filteredUpcoming = eventsData.upcoming.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCourse = courseFilter === "all" || event.course === courseFilter
    return matchesSearch && matchesCourse
  })

  const filteredReplays = eventsData.replays.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCourse = courseFilter === "all" || event.course === courseFilter
    return matchesSearch && matchesCourse
  })

  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Events & Replays</h1>
          <p className="text-muted-foreground">Join live sessions or watch recorded content</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by course" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="Digital Marketing Mastery">Digital Marketing</SelectItem>
              <SelectItem value="Copywriting Fundamentals">Copywriting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="replays">Replays</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-6">
          {filteredUpcoming.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No upcoming events match your search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredUpcoming.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="mt-1">{event.course}</CardDescription>
                      </div>
                      <Badge variant={event.type === "Zoom Call" ? "default" : "secondary"}>{event.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{event.description}</p>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {event.date}, {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>Hosted by {event.host}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {event.registered ? (
                      <Button className="w-full" asChild>
                        <Link href={`/events/${event.id}`}>Join Event</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Register
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="replays" className="space-y-6">
          {filteredReplays.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No replays match your search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredReplays.map((replay) => (
                <Card key={replay.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{replay.title}</CardTitle>
                        <CardDescription className="mt-1">{replay.course}</CardDescription>
                      </div>
                      <Badge variant="outline">{replay.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{replay.description}</p>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Recorded on {replay.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {replay.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{replay.views} views</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/events/replay/${replay.id}`}>Watch Replay</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
