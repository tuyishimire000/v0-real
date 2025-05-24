"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Database, Loader2, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createSampleData } from "@/app/actions/admin"

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  const handleCreateSampleData = async () => {
    setIsLoading(true)
    const result = await createSampleData()
    setResult(result)
    setIsLoading(false)
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Admin Setup
            </CardTitle>
            <CardDescription>Set up sample data for testing the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {result.success
                    ? "Sample data has been created successfully. You can now see the admin dashboard in action."
                    : `Failed to create sample data: ${result.error}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What will be created:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>3 sample courses (Digital Marketing, Copywriting, Social Media)</li>
                  <li>2 sample challenges with different difficulty levels</li>
                  <li>Sample data to populate the admin dashboard</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> This will create sample data in your database. This is safe to run multiple
                  times as it will only create new records.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleCreateSampleData} disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Sample Data
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/admin">View Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
