import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  authApi,
  getStoredToken,
  getStoredUser,
  clearStoredAuth,
  type User,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Revalidate session on initial mount
  useEffect(() => {
    let isMounted = true

    async function verifySession() {
      const savedToken = getStoredToken()
      if (!savedToken) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const response = await authApi.getMe()
        if (isMounted && response.user) {
          setUser(response.user)
        }
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status
        if (status === 401) {
          clearStoredAuth()
          if (isMounted) {
            setUser(null)
            setToken(null)
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await authApi.login(payload)
    setUser(res.user)
    setToken(res.token)
    return res
  }

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await authApi.register(payload)
    setUser(res.user)
    setToken(res.token)
    return res
  }

  const logout = async (): Promise<void> => {
    await authApi.logout()
    setUser(null)
    setToken(null)
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

