import * as React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LogIn } from "lucide-react"

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanIdentifier = identifier.trim()
    if (!cleanIdentifier) {
      setErrorMessage("Please enter your Registration ID or Phone Number.")
      return
    }

    if (!password) {
      setErrorMessage("Please enter your password.")
      return
    }

    try {
      setIsLoading(true)
      const res = await login({
        identifier: cleanIdentifier,
        password,
      })

      setSuccessMessage(`Welcome back, ${res.user.name}! Redirecting...`)
      setTimeout(() => {
        navigate("/")
      }, 700)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials and try again."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md shadow-lg border border-border">
        <CardHeader className="text-center sm:text-left space-y-1.5 pb-4">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-semibold text-sm">
            <LogIn className="h-4 w-4" />
            <span>Student Portal</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
          <CardDescription>
            Enter your Registration ID or Email and password to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error Message Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div
              role="status"
              className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="login-identifier">
                  Registration ID or Email
                </FieldLabel>
                <Input
                  id="login-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  disabled={isLoading}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  placeholder="e.g. 12215843 or 9876543210"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    placeholder="Enter your password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="w-full sm:w-auto cursor-pointer"
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto cursor-pointer min-w-[110px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>

              <div className="text-center pt-2 text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Register here
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
