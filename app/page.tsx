import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-center px-4">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Advanced Learning Platform</h1>
        <p className="text-xl text-muted-foreground">
          Master real-world skills with expert-led courses, practical challenges, and a supportive community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
