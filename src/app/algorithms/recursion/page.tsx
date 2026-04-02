"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MainLayout } from '@/components/layout/main-layout'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Code2,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface TreeNode {
  id: string
  value: number
  x: number
  y: number
  state: 'default' | 'calculating' | 'completed' | 'base'
  left?: string
  right?: string
  parent?: string
}

const ALGORITHMS = {
  fibonacci: {
    name: 'Fibonacci Sequence',
    complexity: { time: 'O(2^n)', space: 'O(n)' },
    description: 'Calculates the nth Fibonacci number using recursion.'
  },
  factorial: {
    name: 'Factorial',
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Calculates the factorial of a number using recursion.'
  }
}

export default function RecursionPage() {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('fibonacci')
  const [inputValue, setInputValue] = useState('5')
  const [speed, setSpeed] = useState([50])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentNode, setCurrentNode] = useState<string>('')
  const [result, setResult] = useState<number | null>(null)
  const [callStack, setCallStack] = useState<string[]>([])
  const [stepDescription, setStepDescription] = useState('')
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Generate Fibonacci tree
  const generateFibonacciTree = useCallback((n: number): TreeNode[] => {
    const nodes: TreeNode[] = []
    let nodeId = 0
    
    const createNode = (value: number, x: number, y: number, parent?: string): string => {
      const id = `node_${nodeId++}`
      nodes.push({
        id,
        value,
        x,
        y,
        state: 'default',
        parent
      })
      return id
    }
    
    const buildTree = (n: number, x: number, y: number, spread: number, parent?: string): string => {
      const nodeId = createNode(n, x, y, parent)
      
      if (n <= 1) {
        return nodeId
      }
      
      const leftId = buildTree(n - 1, x - spread, y + 80, spread / 2, nodeId)
      const rightId = buildTree(n - 2, x + spread, y + 80, spread / 2, nodeId)
      
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        node.left = leftId
        node.right = rightId
      }
      
      return nodeId
    }
    
    buildTree(n, 400, 50, 150)
    return nodes
  }, [])

  // Generate Factorial tree
  const generateFactorialTree = useCallback((n: number): TreeNode[] => {
    const nodes: TreeNode[] = []
    let nodeId = 0
    
    const createNode = (value: number, x: number, y: number, parent?: string): string => {
      const id = `node_${nodeId++}`
      nodes.push({
        id,
        value,
        x,
        y,
        state: 'default',
        parent
      })
      return id
    }
    
    const buildTree = (n: number, x: number, y: number, parent?: string): string => {
      const nodeId = createNode(n, x, y, parent)
      
      if (n <= 1) {
        return nodeId
      }
      
      const childId = buildTree(n - 1, x, y + 80, nodeId)
      
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        node.left = childId
      }
      
      return nodeId
    }
    
    buildTree(n, 400, 50)
    return nodes
  }, [])

  // Initialize tree based on algorithm
  const initializeTree = useCallback(() => {
    const n = parseInt(inputValue) || 5
    if (selectedAlgorithm === 'fibonacci') {
      return generateFibonacciTree(n)
    } else {
      return generateFactorialTree(n)
    }
  }, [inputValue, selectedAlgorithm, generateFibonacciTree, generateFactorialTree])

  useEffect(() => {
    setTree(initializeTree())
    resetVisualization()
  }, [initializeTree])

  const resetVisualization = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentNode('')
    setResult(null)
    setCallStack([])
    setStepDescription('')
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    // Reset all node states
    setTree(prev => prev.map(node => ({ ...node, state: 'default' })))
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Fibonacci visualization
  const visualizeFibonacci = async () => {
    const n = parseInt(inputValue) || 5
    const memo = new Map<string, number>()
    const stack: string[] = []
    
    const fib = async (nodeId: string, n: number): Promise<number> => {
      if (!isPlaying || isPaused) return 0
      
      // Update current node
      setCurrentNode(nodeId)
      setTree(prev => prev.map(node => 
        node.id === nodeId ? { ...node, state: 'calculating' } : node
      ))
      
      // Update call stack
      stack.push(`fib(${n})`)
      setCallStack([...stack])
      setStepDescription(`Calculating fib(${n})`)
      
      await sleep(101 - speed[0])
      
      if (n <= 1) {
        setTree(prev => prev.map(node => 
          node.id === nodeId ? { ...node, state: 'base' } : node
        ))
        setStepDescription(`Base case: fib(${n}) = ${n}`)
        await sleep(101 - speed[0])
        
        stack.pop()
        setCallStack([...stack])
        return n
      }
      
      // Get child nodes
      const node = tree.find(n => n.id === nodeId)
      const leftResult = await fib(node?.left || '', n - 1)
      const rightResult = await fib(node?.right || '', n - 2)
      
      const result = leftResult + rightResult
      memo.set(nodeId, result)
      
      setTree(prev => prev.map(n => 
        n.id === nodeId ? { ...n, state: 'completed', value: result } : n
      ))
      
      stack.pop()
      setCallStack([...stack])
      setStepDescription(`fib(${n}) = fib(${n-1}) + fib(${n-2}) = ${leftResult} + ${rightResult} = ${result}`)
      
      await sleep(101 - speed[0])
      return result
    }
    
    const rootNode = tree[0]?.id
    if (rootNode) {
      const finalResult = await fib(rootNode, n)
      setResult(finalResult)
      setStepDescription(`Final result: fib(${n}) = ${finalResult}`)
    }
    
    setIsPlaying(false)
  }

  // Factorial visualization
  const visualizeFactorial = async () => {
    const n = parseInt(inputValue) || 5
    const stack: string[] = []
    
    const factorial = async (nodeId: string, n: number): Promise<number> => {
      if (!isPlaying || isPaused) return 1
      
      // Update current node
      setCurrentNode(nodeId)
      setTree(prev => prev.map(node => 
        node.id === nodeId ? { ...node, state: 'calculating' } : node
      ))
      
      // Update call stack
      stack.push(`fact(${n})`)
      setCallStack([...stack])
      setStepDescription(`Calculating factorial(${n})`)
      
      await sleep(101 - speed[0])
      
      if (n <= 1) {
        setTree(prev => prev.map(node => 
          node.id === nodeId ? { ...node, state: 'base' } : node
        ))
        setStepDescription(`Base case: factorial(${n}) = 1`)
        await sleep(101 - speed[0])
        
        stack.pop()
        setCallStack([...stack])
        return 1
      }
      
      // Get child node
      const node = tree.find(n => n.id === nodeId)
      const childResult = await factorial(node?.left || '', n - 1)
      
      const result = n * childResult
      
      setTree(prev => prev.map(n => 
        n.id === nodeId ? { ...n, state: 'completed', value: result } : n
      ))
      
      stack.pop()
      setCallStack([...stack])
      setStepDescription(`factorial(${n}) = ${n} × factorial(${n-1}) = ${n} × ${childResult} = ${result}`)
      
      await sleep(101 - speed[0])
      return result
    }
    
    const rootNode = tree[0]?.id
    if (rootNode) {
      const finalResult = await factorial(rootNode, n)
      setResult(finalResult)
      setStepDescription(`Final result: factorial(${n}) = ${finalResult}`)
    }
    
    setIsPlaying(false)
  }

  const handlePlay = () => {
    const n = parseInt(inputValue)
    if (isNaN(n) || n < 0) {
      alert('Please enter a valid non-negative number')
      return
    }
    
    if (n > 10 && selectedAlgorithm === 'fibonacci') {
      alert('For Fibonacci, please enter a number ≤ 10 to avoid excessive recursion')
      return
    }
    
    resetVisualization()
    setIsPlaying(true)
    setIsPaused(false)
    
    if (selectedAlgorithm === 'fibonacci') {
      visualizeFibonacci()
    } else if (selectedAlgorithm === 'factorial') {
      visualizeFactorial()
    }
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    resetVisualization()
    setTree(initializeTree())
  }

  const getNodeColor = (state: TreeNode['state']) => {
    switch (state) {
      case 'calculating': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      case 'base': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  const algorithm = ALGORITHMS[selectedAlgorithm as keyof typeof ALGORITHMS]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recursion Visualizer</h1>
            <p className="text-muted-foreground">
              Watch recursive algorithms build and solve their call trees
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Visualizer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  {algorithm.name}
                </CardTitle>
                <CardDescription>{algorithm.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Input */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    Input Value (n):
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isPlaying}
                      className="flex-1"
                      min="0"
                      max={selectedAlgorithm === 'fibonacci' ? "10" : "20"}
                    />
                    <Button onClick={handlePlay} disabled={isPlaying}>
                      <Play className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </div>
                </div>

                {/* Tree Visualization */}
                <div className="relative h-96 bg-muted/20 rounded-lg mb-6 overflow-auto">
                  <svg className="w-full h-full" style={{ minWidth: '800px' }}>
                    {/* Draw edges */}
                    {tree.map((node) => {
                      if (!node.left) return null
                      const childNode = tree.find(n => n.id === node.left)
                      if (!childNode) return null
                      
                      return (
                        <line
                          key={`${node.id}-${node.left}`}
                          x1={node.x}
                          y1={node.y}
                          x2={childNode.x}
                          y2={childNode.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      )
                    })}
                    
                    {tree.map((node) => {
                      if (!node.right) return null
                      const childNode = tree.find(n => n.id === node.right)
                      if (!childNode) return null
                      
                      return (
                        <line
                          key={`${node.id}-${node.right}`}
                          x1={node.x}
                          y1={node.y}
                          x2={childNode.x}
                          y2={childNode.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      )
                    })}
                    
                    {/* Draw nodes */}
                    {tree.map((node) => (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          className={getNodeColor(node.state)}
                          fill="currentColor"
                        />
                        <text
                          x={node.x}
                          y={node.y + 5}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {node.value}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Result */}
                {result !== null && (
                  <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
                    <p className="font-bold">Result: {result}</p>
                  </div>
                )}

                {/* Step Description */}
                {stepDescription && (
                  <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
                    <p className="text-sm">{stepDescription}</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <Button variant="outline" onClick={handlePause} disabled={!isPlaying || isPaused}>
                    <Pause className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" onClick={handleReset} disabled={isPlaying}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Algorithm Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Algorithm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ALGORITHMS).map(([key, algo]) => (
                      <SelectItem key={key} value={key}>
                        {algo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time Complexity:</span>
                    <span className="font-mono">{algorithm.complexity.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Space Complexity:</span>
                    <span className="font-mono">{algorithm.complexity.space}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Speed: {speed[0]}%</label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    max={100}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleReset} variant="outline" className="w-full" disabled={isPlaying}>
                  Reset Visualization
                </Button>
              </CardContent>
            </Card>

            {/* Call Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Call Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {callStack.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Empty</p>
                  ) : (
                    callStack.map((call, index) => (
                      <div
                        key={index}
                        className="p-2 bg-muted rounded text-sm font-mono"
                        style={{ marginLeft: `${index * 8}px` }}
                      >
                        {call}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Not Calculated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Calculating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Base Case</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}