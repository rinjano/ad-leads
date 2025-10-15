'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Target, TrendingUp, HeadphonesIcon } from "lucide-react"
import { toast } from 'react-toastify'

// Using loginSchema from lib/validations/auth.ts

// Demo accounts for testing
const demoAccounts = [
  { 
    email: 'admin@demo.com', 
    role: 'Super Admin',
    description: 'Full system access, user management, all data control',
    icon: Shield,
    color: 'text-red-600 bg-red-50 border-red-200'
  },
  { 
    email: 'representative@demo.com', 
    role: 'CS Representative',
    description: 'Full dashboard, all prospects, conversion actions, reports',
    icon: User,
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  { 
    email: 'advertiser@demo.com', 
    role: 'Advertiser',
    description: 'Dashboard, read-only prospects, ads spend management',
    icon: Target,
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  { 
    email: 'support@demo.com', 
    role: 'CS Support',
    description: 'Limited dashboard, own data only, basic access',
    icon: HeadphonesIcon,
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  { 
    email: 'retention@demo.com', 
    role: 'Retention Specialist',
    description: 'LTV & Retention pages only, specialized reports',
    icon: TrendingUp,
    color: 'text-orange-600 bg-orange-50 border-orange-200'
  },
];

export default function LoginPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      // Use NextAuth signIn with credentials
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
        setError('root', {
          type: 'manual',
          message: 'Invalid email or password',
        })
        return
      }

      // Login successful
      toast.success('Login successful! Redirecting to dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 500)
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.')
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.',
      })
    }
  }

  const handleDemoLogin = (email: string) => {
    setValue('email', email);
    setValue('password', 'demo123');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Lead Management System</CardTitle>
          <CardDescription className="text-blue-100">
            Enter your credentials or try a demo account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className={`text-sm font-medium ${
                      errors.email ? "text-destructive" : ""
                    }`}
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className={`text-sm font-medium ${
                      errors.password ? "text-destructive" : ""
                    }`}
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {errors.root && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.root.message}
                  </p>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="demo" className="space-y-4 mt-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Test different role permissions with these demo accounts
                </p>
                <Badge variant="outline" className="text-xs">
                  All accounts use password: <code className="ml-1">demo123</code>
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {demoAccounts.map((account, index) => {
                  const IconComponent = account.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg hover:shadow-md cursor-pointer transition-all duration-200 ${account.color}`}
                      onClick={() => handleDemoLogin(account.email)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/50">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{account.role}</h4>
                            <Button size="sm" variant="outline" className="text-xs h-6">
                              Use Account
                            </Button>
                          </div>
                          <p className="text-xs opacity-80 leading-relaxed">{account.email}</p>
                          <p className="text-xs opacity-70 mt-1 leading-relaxed">{account.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}