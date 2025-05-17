"use client"

import { useState } from "react"
import { createAdminUser } from "../actions/create-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  const handleCreateAdmin = async () => {
    setIsLoading(true)
    const result = await createAdminUser()
    setResult(result)
    setIsLoading(false)
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>Create an admin user for the learning platform</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.success
                  ? "Admin user created successfully. You can now log in."
                  : `Failed to create admin user: ${result.error}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email:</p>
              <p className="text-sm">admin@example.com</p>
            </div>
            <div>
              <p className="text-sm font-medium">Password:</p>
              <p className="text-sm">password123</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateAdmin} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Admin User
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
