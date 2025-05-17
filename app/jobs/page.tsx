"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, Clock, DollarSign, Filter, MapPin, Search, Tag } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock jobs data
const jobsData = {
  jobs: [
    {
      id: "j1",
      title: "Social Media Manager",
      company: "Digital Marketing Agency",
      location: "Remote",
      type: "Full-time",
      salary: "$50,000 - $65,000",
      description:
        "We're looking for a Social Media Manager to develop and implement our Social Media strategy in order to increase our online presence and improve our marketing and sales efforts.",
      requirements: [
        "2+ years of experience in social media management",
        "Proficient in Facebook, Instagram, Twitter, and LinkedIn",
        "Experience with social media analytics",
        "Excellent copywriting skills",
      ],
      postedDate: "2 days ago",
      postedBy: {
        name: "Jane Smith",
        role: "Mentor",
      },
      skills: ["Social Media Marketing", "Content Creation", "Analytics", "Copywriting"],
    },
    {
      id: "j2",
      title: "Email Marketing Specialist",
      company: "E-commerce Startup",
      location: "New York, NY",
      type: "Contract",
      salary: "$40/hour",
      description:
        "We are seeking an Email Marketing Specialist to help us create and execute email campaigns that drive sales and customer engagement.",
      requirements: [
        "Experience with email marketing platforms (Mailchimp, Klaviyo)",
        "Understanding of email deliverability and best practices",
        "Ability to analyze campaign performance",
        "HTML and CSS knowledge a plus",
      ],
      postedDate: "1 week ago",
      postedBy: {
        name: "Mike Wilson",
        role: "Mentor",
      },
      skills: ["Email Marketing", "Copywriting", "Analytics", "HTML/CSS"],
    },
    {
      id: "j3",
      title: "Content Writer",
      company: "Marketing Blog",
      location: "Remote",
      type: "Part-time",
      salary: "$25/hour",
      description:
        "We're looking for a talented Content Writer to create engaging blog posts, articles, and social media content related to digital marketing topics.",
      requirements: [
        "Strong writing and editing skills",
        "Knowledge of SEO best practices",
        "Ability to research and write about various marketing topics",
        "Portfolio of published work",
      ],
      postedDate: "3 days ago",
      postedBy: {
        name: "John Doe",
        role: "Mentor",
      },
      skills: ["Content Writing", "SEO", "Research", "Editing"],
    },
    {
      id: "j4",
      title: "PPC Specialist",
      company: "Digital Agency",
      location: "Chicago, IL",
      type: "Full-time",
      salary: "$60,000 - $75,000",
      description:
        "We are looking for a PPC Specialist to manage our clients' paid advertising campaigns across Google, Facebook, and other platforms.",
      requirements: [
        "2+ years of experience in PPC advertising",
        "Google Ads and Facebook Ads certification",
        "Experience with campaign optimization and A/B testing",
        "Strong analytical skills",
      ],
      postedDate: "5 days ago",
      postedBy: {
        name: "Sarah Johnson",
        role: "Mentor",
      },
      skills: ["Google Ads", "Facebook Ads", "Analytics", "A/B Testing"],
    },
  ],
  applications: [
    {
      id: "a1",
      jobId: "j1",
      jobTitle: "Social Media Manager",
      company: "Digital Marketing Agency",
      appliedDate: "1 day ago",
      status: "Under Review",
    },
  ],
  savedJobs: [
    {
      id: "j2",
      title: "Email Marketing Specialist",
      company: "E-commerce Startup",
      location: "New York, NY",
      type: "Contract",
      salary: "$40/hour",
      postedDate: "1 week ago",
    },
  ],
}

export default function JobsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

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

  // Filter jobs based on search query and filters
  const filteredJobs = jobsData.jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || job.type === typeFilter
    const matchesLocation = locationFilter === "all" || job.location === locationFilter
    return matchesSearch && matchesType && matchesLocation
  })

  return (
    <div className="container py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground">Find opportunities to apply your skills</p>
        </div>
        <div>
          <Button>
            <Briefcase className="mr-2 h-4 w-4" />
            Post a Job
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Job Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="New York, NY">New York</SelectItem>
                <SelectItem value="Chicago, IL">Chicago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
              <TabsTrigger value="applications">My Applications</TabsTrigger>
              <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
            </TabsList>
            <TabsContent value="browse" className="space-y-6">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No jobs match your search criteria.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <CardTitle>{job.title}</CardTitle>
                          <CardDescription className="mt-1">{job.company}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="outline">{job.location}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{job.description}</p>
                      <div>
                        <h4 className="mb-2 font-medium">Requirements:</h4>
                        <ul className="ml-6 list-disc space-y-1 text-sm">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 pt-2 text-sm sm:flex-row sm:items-center">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Posted {job.postedDate}</span>
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <span>
                            by {job.postedBy.name} ({job.postedBy.role})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 sm:flex-row">
                      <Button className="w-full sm:w-auto" asChild>
                        <Link href={`/jobs/${job.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Save Job
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
            <TabsContent value="applications" className="space-y-6">
              {jobsData.applications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="#browse">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (
                jobsData.applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <CardTitle>{application.jobTitle}</CardTitle>
                      <CardDescription>{application.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Applied {application.appliedDate}</span>
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <Badge variant={application.status === "Under Review" ? "outline" : "default"}>
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full sm:w-auto" asChild>
                        <Link href={`/jobs/applications/${application.id}`}>View Application</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
            <TabsContent value="saved" className="space-y-6">
              {jobsData.savedJobs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">You haven't saved any jobs yet.</p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="#browse">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (
                jobsData.savedJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Posted {job.postedDate}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 sm:flex-row">
                      <Button className="w-full sm:w-auto" asChild>
                        <Link href={`/jobs/${job.id}`}>Apply Now</Link>
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Completion</h3>
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile</span>
                    <span>80%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Portfolio</span>
                    <span>60%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skills</span>
                    <span>70%</span>
                  </div>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href="/profile">Complete Your Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Skills in Demand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm">
                  <Tag className="mr-1 h-3 w-3" />
                  Social Media Marketing
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Tag className="mr-1 h-3 w-3" />
                  Content Creation
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Tag className="mr-1 h-3 w-3" />
                  Email Marketing
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Tag className="mr-1 h-3 w-3" />
                  SEO
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Tag className="mr-1 h-3 w-3" />
                  Google Ads
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Tag className="mr-1 h-3 w-3" />
                  Analytics
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Tag className="mr-1 h-3 w-3" />
                  Copywriting
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">Optimize your job search with these tips:</p>
              <ul className="ml-6 list-disc text-sm">
                <li>Complete your profile to 100%</li>
                <li>Showcase your completed challenges</li>
                <li>Highlight relevant course certifications</li>
                <li>Tailor your application to each job</li>
                <li>Follow up after applying</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/resources/job-search">Read More Tips</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
