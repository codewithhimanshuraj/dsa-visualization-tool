"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart3, 
  BookOpen, 
  Code2, 
  GitBranch, 
  Home, 
  Search, 
  Zap,
  TrendingUp,
  Clock
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sorting Algorithms", href: "/algorithms/sorting", icon: BarChart3 },
  { name: "Searching Algorithms", href: "/algorithms/searching", icon: Search },
  { name: "Graph Algorithms", href: "/algorithms/graph", icon: GitBranch },
  { name: "Recursion", href: "/algorithms/recursion", icon: Code2 },
  { name: "Pathfinding", href: "/algorithms/pathfinding", icon: Zap },
  { name: "Complexity Analysis", href: "/complexity", icon: TrendingUp },
  { name: "Practice Sessions", href: "/practice", icon: Clock },
]

const resources = [
  { name: "Bookmarks", href: "/bookmarks", icon: BookOpen },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Algorithms
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href} className="flex items-center">
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Resources
          </h2>
          <div className="space-y-1">
            {resources.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href} className="flex items-center">
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}