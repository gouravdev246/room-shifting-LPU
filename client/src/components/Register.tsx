import * as React from "react"
import { useState } from "react"
import { useNavigate , Link} from "react-router-dom"
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

export function Register() {
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

  const handleReset = () => {
    setFormData({
      name: "",
      regId: "",
      contact: "",
      password: "",
    })
  }

  return (
    <div className="flex-1 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 sm:p-6 lg:p-4">
      <Card className="w-full max-w-md shadow-lg border border-border p-1 sm:p-8">
        <CardHeader className="px-0 pt-0 pb-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Enter your registration details to access your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="w-full">
          <FieldGroup className="space-y-1">
            <Field>
              <FieldLabel htmlFor="login-name">Name</FieldLabel>
              <Input
                id="login-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                required
              />
            </Field>

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
              <FieldLabel htmlFor="login-contact">Contact Number</FieldLabel>
              <Input
                id="login-contact"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+91 62957XXXXX"
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
                >
              
                 <Link to="/login"
                className="w-full sm:w-auto cursor-pointer"
                
              >
                --Login--
              </Link>
              </Button>
              <Button type="submit" className="w-full sm:w-auto cursor-pointer">
                --Register--
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Card>
    </div>
  )
}

export default Register 
