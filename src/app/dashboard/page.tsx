"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuthStore } from '@/lib/store/auth'
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  Play, 
  Search, 
  TrendingUp,
  Zap,
  Code2,
  GitBranch,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalAlgorithms: number
  completedAlgorithms: number
  totalTimeSpent: number
  currentStreak: number
  recentActivity: Array<{
    algorithmName: string
    completedAt: string
    timeSpent: number
  }>
  progressByCategory: Array<{
    category: string
    completed: number
    total: number
    icon: React.ReactNode
  }>
}

const categories = [
  { name: 'Sorting', icon: BarChart3, color: 'bg-blue-500' },
  { name: 'Searching', icon: Search, color: 'bg-green-500' },
  { name: 'Graph', icon: GitBranch, color: 'bg-purple-500' },
  { name: 'Recursion', icon: Code2, color: 'bg-orange-500' },
  { name: 'Pathfinding', icon: Zap, color: 'bg-pink-500' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalAlgorithms: 15,
    completedAlgorithms: 7,
    totalTimeSpent: 245, // minutes
    currentStreak: 5,
    recentActivity: [
      { algorithmName: 'Bubble Sort', completedAt: '2024-01-15', timeSpent: 15 },
      { algorithmName: 'Binary Search', completedAt: '2024-01-14', timeSpent: 12 },
      { algorithmName: 'Merge Sort', completedAt: '2024-01-13', timeSpent: 25 },
    ],
    progressByCategory: [
      { category: 'Sorting', completed: 3, total: 5, icon: <BarChart3 className="h-4 w-4" /> },
      { category: 'Searching', completed: 2, total: 2, icon: <Search className="h-4 w-4" /> },
      { category: 'Graph', completed: 1, total: 3, icon: <GitBranch className="h-4 w-4" /> },
      { category: 'Recursion', completed: 1, total: 2, icon: <Code2 className="h-4 w-4" /> },
      { category: 'Pathfinding', completed: 0, total: 3, icon: <Zap className="h-4 w-4" /> },
    ]
  })

  const completionPercentage = Math.round((stats.completedAlgorithms / stats.totalAlgorithms) * 100)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your journey to mastering algorithms
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAlgorithms}/{stats.totalAlgorithms}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.currentStreak} day streak
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTimeSpent}m</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <Progress value={completionPercentage} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Progress by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Progress by Category</CardTitle>
              <CardDescription>
                Your completion status across different algorithm categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.progressByCategory.map((category) => {
                const percentage = Math.round((category.completed / category.total) * 100)
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {category.completed}/{category.total}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest algorithm practice sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.algorithmName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.completedAt} • {activity.timeSpent} min
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump back into learning or try something new
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button asChild className="h-16 flex-col space-y-2">
                <Link href="/algorithms/sorting">
                  <BarChart3 className="h-6 w-6" />
                  <span>Practice Sorting</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col space-y-2">
                <Link href="/algorithms/searching">
                  <Search className="h-6 w-6" />
                  <span>Practice Searching</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col space-y-2">
                <Link href="/algorithms/graph">
                  <GitBranch className="h-6 w-6" />
                  <span>Explore Graphs</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col space-y-2">
                <Link href="/algorithms/recursion">
                  <Code2 className="h-6 w-6" />
                  <span>Learn Recursion</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col space-y-2">
                <Link href="/algorithms/pathfinding">
                  <Zap className="h-6 w-6" />
                  <span>Pathfinding</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col space-y-2">
                <Link href="/chat">
                  <Sparkles className="h-6 w-6" />
                  <span>AI Assistant</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}