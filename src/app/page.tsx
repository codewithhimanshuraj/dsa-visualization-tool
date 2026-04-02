"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store/auth"
import { 
  BarChart3, 
  BookOpen, 
  Code2, 
  GitBranch, 
  Play, 
  Search, 
  Sparkles,
  Users,
  Zap
} from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Sorting Algorithms",
    description: "Visualize Bubble, Merge, Quick, and more sorting algorithms step-by-step",
    href: "/algorithms/sorting"
  },
  {
    icon: Search,
    title: "Searching Algorithms",
    description: "Understand Linear and Binary search with interactive visualizations",
    href: "/algorithms/searching"
  },
  {
    icon: GitBranch,
    title: "Graph Algorithms",
    description: "Explore BFS, DFS and other graph traversal algorithms",
    href: "/algorithms/graph"
  },
  {
    icon: Code2,
    title: "Recursion",
    description: "Visualize recursive algorithms like Fibonacci and Factorial",
    href: "/algorithms/recursion"
  },
  {
    icon: Zap,
    title: "Pathfinding",
    description: "Interactive pathfinding with Dijkstra and A* algorithms",
    href: "/algorithms/pathfinding"
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Get help from AI to understand complex algorithms and DSA concepts",
    href: "/chat"
  }
]

const stats = [
  { label: "Algorithms", value: "15+" },
  { label: "Code Languages", value: "3" },
  { label: "Active Users", value: "1000+" },
  { label: "Practice Sessions", value: "5000+" }
]

export default function HomePage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="container px-4 py-16 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Master Data Structures &
            <span className="text-primary"> Algorithms</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interactive visualizations that make complex algorithms easy to understand. 
            Learn by watching step-by-step animations with code in multiple languages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/algorithms/sorting">
                <Play className="mr-2 h-5 w-5" />
                Start Learning
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/auth/signup">
                Get Started Free
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-16 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Algorithms</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from a wide range of algorithms with interactive visualizations, 
            code examples, and detailed explanations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={feature.href}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start group-hover:text-primary">
                      Explore →
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 mx-auto">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Join Our Learning Community</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track your progress, bookmark favorite algorithms, and compete with others. 
              Start your journey to becoming a DSA expert today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Sign Up Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}