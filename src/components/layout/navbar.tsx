"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useAuthStore } from "@/lib/store/auth"
import { 
  BarChart3, 
  BookOpen, 
  Code2, 
  GitBranch, 
  Home, 
  LogOut, 
  Search, 
  Settings, 
  User,
  Zap
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sorting", href: "/algorithms/sorting", icon: BarChart3 },
  { name: "Searching", href: "/algorithms/searching", icon: Search },
  { name: "Graph", href: "/algorithms/graph", icon: GitBranch },
  { name: "Recursion", href: "/algorithms/recursion", icon: Code2 },
  { name: "Pathfinding", href: "/algorithms/pathfinding", icon: Zap },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const isLoggedIn = !!user

  const handleLogout = () => {
    logout()
    // Redirect to home page
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DSA Visualizer</span>
          </Link>
          
          {isLoggedIn && (
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href={item.href} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt={user?.name || user?.email} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks" className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Bookmarks</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}