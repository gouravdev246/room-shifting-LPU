import * as React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    regId: "",
    contact: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to home after login
    navigate("/")
  }

  return (
    <div className="flex-1 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 sm:p-6 lg:p-4">
      <Card className="w-full max-w-md shadow-lg border border-border p-5 sm:p-8">
        <CardHeader className="px-0 pt-0 pb-2 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your details to access your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="w-full">
          <FieldGroup className="space-y-1">
            <Field>
              <FieldLabel htmlFor="login-regid">RegID</FieldLabel>
              <Input
                id="login-regid"
                name="regId"
                type="text"
                value={formData.regId}
                onChange={handleChange}
                placeholder="1250XXXX"
                required
              />
            </Field>

            

            <Field>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                id="login-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Your Password"
                required
              />
            </Field>

            <Field orientation="horizontal" className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
              <Button type="submit" className="w-full sm:w-auto cursor-pointer">
                Login
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Card>
    </div>
  )
}

export default Login 
