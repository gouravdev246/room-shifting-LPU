import * as React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, UserPlus } from "lucide-react"

const hostelOptions = [
  { label: "BH-1 (Boys Hostel 1)", value: "BH-1", group: "Boys Hostels" },
  { label: "BH-2 (Boys Hostel 2)", value: "BH-2", group: "Boys Hostels" },
  { label: "BH-3 (Boys Hostel 3)", value: "BH-3", group: "Boys Hostels" },
  { label: "BH-4 (Boys Hostel 4)", value: "BH-4", group: "Boys Hostels" },
  { label: "BH-5 (Boys Hostel 5)", value: "BH-5", group: "Boys Hostels" },
  { label: "GH-1 (Girls Hostel 1)", value: "GH-1", group: "Girls Hostels" },
  { label: "GH-2 (Girls Hostel 2)", value: "GH-2", group: "Girls Hostels" },
  { label: "GH-3 (Girls Hostel 3)", value: "GH-3", group: "Girls Hostels" },
  { label: "GH-4 (Girls Hostel 4)", value: "GH-4", group: "Girls Hostels" },
  { label: "Hostel 1", value: "Hostel 1", group: "Other Hostels" },
  { label: "Hostel 2", value: "Hostel 2", group: "Other Hostels" },
  { label: "Hostel 3", value: "Hostel 3", group: "Other Hostels" },
]

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    regId: "",
    phone: "",
    hostel: "BH-1",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage(null)
  }

  const handleHostelChange = (val: string | null) => {
    if (val) {
      setFormData((prev) => ({ ...prev, hostel: val }))
      if (errorMessage) setErrorMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanName = formData.name.trim()
    const cleanRegId = formData.regId.trim()
    const cleanPhone = formData.phone.trim().replace(/\D/g, "") // strip non-digits if any
    const cleanHostel = formData.hostel.trim()

    // Validation checks
    if (!cleanName) {
      setErrorMessage("Please enter your full name.")
      return
    }

    if (!cleanRegId) {
      setErrorMessage("Please enter your Registration ID.")
      return
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.")
      return
    }

    if (!cleanHostel) {
      setErrorMessage("Please select your current hostel.")
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your password.")
      return
    }

    try {
      setIsLoading(true)
      const res = await register({
        name: cleanName,
        reg_id: cleanRegId,
        phone: cleanPhone,
        hostel: cleanHostel,
        password: formData.password,
      })

      setSuccessMessage(`Account created successfully! Welcome, ${res.user.name}. Redirecting...`)
      setTimeout(() => {
        navigate("/")
      }, 800)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please check your information and try again."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg shadow-lg border border-border">
        <CardHeader className="text-center sm:text-left space-y-1.5 pb-4">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-semibold text-sm">
            <UserPlus className="h-4 w-4" />
            <span>Join Student Portal</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Register</CardTitle>
          <CardDescription>
            Create an account to post room shift requests and find your future roommate.
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
            <FieldGroup className="space-y-3.5">
              {/* Full Name */}
              <Field>
                <FieldLabel htmlFor="register-name">Full Name</FieldLabel>
                <Input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  disabled={isLoading}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </Field>

              {/* Registration ID & Phone Number Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field>
                  <FieldLabel htmlFor="register-regid">Registration ID</FieldLabel>
                  <Input
                    id="register-regid"
                    name="regId"
                    type="text"
                    autoComplete="username"
                    value={formData.regId}
                    disabled={isLoading}
                    onChange={handleChange}
                    placeholder="e.g. 12215843"
                    required
                  />
                  <FieldDescription className="text-xs">
                    Your official LPU Reg ID
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="register-phone">Phone Number</FieldLabel>
                  <Input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    disabled={isLoading}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    required
                  />
                  <FieldDescription className="text-xs">
                    10-digit mobile number
                  </FieldDescription>
                </Field>
              </div>

              {/* Hostel Selection */}
              <Field>
                <FieldLabel htmlFor="register-hostel">Current Hostel</FieldLabel>
                <Select
                  items={hostelOptions}
                  value={formData.hostel}
                  onValueChange={handleHostelChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="register-hostel" className="w-full">
                    <SelectValue placeholder="Select your current hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Boys Hostels</SelectLabel>
                      {hostelOptions
                        .filter((h) => h.group === "Boys Hostels")
                        .map((h) => (
                          <SelectItem key={h.value} value={h.value}>
                            {h.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Girls Hostels</SelectLabel>
                      {hostelOptions
                        .filter((h) => h.group === "Girls Hostels")
                        .map((h) => (
                          <SelectItem key={h.value} value={h.value}>
                            {h.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Other Hostels</SelectLabel>
                      {hostelOptions
                        .filter((h) => h.group === "Other Hostels")
                        .map((h) => (
                          <SelectItem key={h.value} value={h.value}>
                            {h.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field>
                  <FieldLabel htmlFor="register-password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      disabled={isLoading}
                      onChange={handleChange}
                      placeholder="Min 6 chars"
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

                <Field>
                  <FieldLabel htmlFor="register-confirm-password">Confirm Password</FieldLabel>
                  <Input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    disabled={isLoading}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                  />
                </Field>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="w-full sm:w-auto cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Already have an account? Login
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto cursor-pointer min-w-[130px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </div>

              <div className="text-center pt-2 text-xs text-muted-foreground">
                By registering, you agree to LPU Room Shifting guidelines and terms.
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
