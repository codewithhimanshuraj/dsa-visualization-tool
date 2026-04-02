"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MainLayout } from '@/components/layout/main-layout'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  GitBranch,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface GraphNode {
  id: string
  x: number
  y: number
  state: 'default' | 'visiting' | 'visited' | 'current' | 'start' | 'end'
  distance?: number
  parent?: string
}

interface GraphEdge {
  from: string
  to: string
  weight?: number
}

const ALGORITHMS = {
  bfs: {
    name: 'Breadth First Search (BFS)',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Explores all vertices at the current depth before moving to vertices at the next depth level.'
  },
  dfs: {
    name: 'Depth First Search (DFS)',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Explores as far as possible along each branch before backtracking.'
  }
}

export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs')
  const [speed, setSpeed] = useState([50])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentNode, setCurrentNode] = useState<string>('')
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set())
  const [visitOrder, setVisitOrder] = useState<string[]>([])
  const [searchComplete, setSearchComplete] = useState(false)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Generate a sample graph
  const generateGraph = useCallback(() => {
    const newNodes: GraphNode[] = []
    const newEdges: GraphEdge[] = []
    
    // Create nodes in a grid-like pattern
    const nodeCount = 12
    const cols = 4
    const rows = 3
    const spacing = 120
    const offsetX = 100
    const offsetY = 100
    
    for (let i = 0; i < nodeCount; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      newNodes.push({
        id: String.fromCharCode(65 + i), // A, B, C, ...
        x: offsetX + col * spacing,
        y: offsetY + row * spacing,
        state: 'default'
      })
    }
    
    // Create edges to form an interesting graph
    const edgePairs = [
      ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'],
      ['C', 'F'], ['C', 'G'], ['D', 'H'], ['E', 'H'],
      ['E', 'I'], ['F', 'J'], ['G', 'J'], ['G', 'K'],
      ['H', 'L'], ['I', 'L'], ['J', 'L'], ['K', 'L'],
      ['D', 'E'], ['F', 'G'], ['H', 'I'], ['J', 'K']
    ]
    
    edgePairs.forEach(([from, to]) => {
      if (newNodes.find(n => n.id === from) && newNodes.find(n => n.id === to)) {
        newEdges.push({ from, to })
      }
    })
    
    return { nodes: newNodes, edges: newEdges }
  }, [])

  const resetTraversal = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentNode('')
    setVisitedNodes(new Set())
    setVisitOrder([])
    setSearchComplete(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    // Reset all node states
    setNodes(prev => prev.map(node => ({ ...node, state: 'default' })))
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateGraph()
    setNodes(newNodes)
    setEdges(newEdges)
    resetTraversal()
  }, [generateGraph])
  /* eslint-enable react-hooks/set-state-in-effect */

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Get adjacent nodes for a given node
  const getAdjacentNodes = (nodeId: string): string[] => {
    const adjacent: string[] = []
    edges.forEach(edge => {
      if (edge.from === nodeId) adjacent.push(edge.to)
      if (edge.to === nodeId) adjacent.push(edge.from)
    })
    return [...new Set(adjacent)] // Remove duplicates
  }

  // BFS Implementation
  const bfs = async () => {
    const startNode = nodes[0]?.id
    if (!startNode) return

    const queue: string[] = [startNode]
    const visited = new Set<string>()
    const order: string[] = []

    while (queue.length > 0 && isPlaying && !isPaused) {
      const current = queue.shift()!
      
      if (visited.has(current)) continue
      
      // Mark as visiting
      setNodes(prev => prev.map(node => 
        node.id === current ? { ...node, state: 'current' } : node
      ))
      setCurrentNode(current)
      await sleep(101 - speed[0])
      
      // Mark as visited
      visited.add(current)
      order.push(current)
      setVisitedNodes(new Set(visited))
      setVisitOrder(order)
      
      setNodes(prev => prev.map(node => 
        node.id === current ? { ...node, state: 'visited' } : node
      ))
      
      // Add unvisited neighbors to queue
      const neighbors = getAdjacentNodes(current)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor)
          // Mark as visiting (in queue)
          setNodes(prev => prev.map(node => 
            node.id === neighbor && node.state === 'default' 
              ? { ...node, state: 'visiting' } 
              : node
          ))
        }
      }
      
      await sleep(101 - speed[0])
    }
    
    setSearchComplete(true)
    setIsPlaying(false)
  }

  // DFS Implementation
  const dfs = async () => {
    const startNode = nodes[0]?.id
    if (!startNode) return

    const visited = new Set<string>()
    const order: string[] = []

    const dfsRecursive = async (nodeId: string) => {
      if (!isPlaying || isPaused) return
      if (visited.has(nodeId)) return

      // Mark as visiting
      setNodes(prev => prev.map(node => 
        node.id === nodeId ? { ...node, state: 'current' } : node
      ))
      setCurrentNode(nodeId)
      await sleep(101 - speed[0])

      // Mark as visited
      visited.add(nodeId)
      order.push(nodeId)
      setVisitedNodes(new Set(visited))
      setVisitOrder(order)

      setNodes(prev => prev.map(node => 
        node.id === nodeId ? { ...node, state: 'visited' } : node
      ))

      // Visit all unvisited neighbors
      const neighbors = getAdjacentNodes(nodeId)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          await dfsRecursive(neighbor)
        }
      }
    }

    await dfsRecursive(startNode)
    
    setSearchComplete(true)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    resetTraversal()
    setIsPlaying(true)
    setIsPaused(false)
    
    if (selectedAlgorithm === 'bfs') {
      bfs()
    } else if (selectedAlgorithm === 'dfs') {
      dfs()
    }
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    resetTraversal()
    const { nodes: newNodes, edges: newEdges } = generateGraph()
    setNodes(newNodes)
    setEdges(newEdges)
  }

  const getNodeColor = (state: GraphNode['state']) => {
    switch (state) {
      case 'current': return 'bg-yellow-500'
      case 'visited': return 'bg-green-500'
      case 'visiting': return 'bg-blue-300'
      default: return 'bg-blue-500'
    }
  }

  const algorithm = ALGORITHMS[selectedAlgorithm as keyof typeof ALGORITHMS]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Graph Algorithms Visualizer</h1>
            <p className="text-muted-foreground">
              Watch graph traversal algorithms explore nodes and edges
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
                  <GitBranch className="h-5 w-5" />
                  {algorithm.name}
                </CardTitle>
                <CardDescription>{algorithm.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Graph Visualization */}
                <div className="relative h-96 bg-muted/20 rounded-lg mb-6 overflow-hidden">
                  <svg className="w-full h-full">
                    {/* Draw edges */}
                    {edges.map((edge, index) => {
                      const fromNode = nodes.find(n => n.id === edge.from)
                      const toNode = nodes.find(n => n.id === edge.to)
                      if (!fromNode || !toNode) return null
                      
                      return (
                        <line
                          key={index}
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      )
                    })}
                    
                    {/* Draw nodes */}
                    {nodes.map((node) => (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="20"
                          className={getNodeColor(node.state)}
                          fill="currentColor"
                        />
                        <text
                          x={node.x}
                          y={node.y + 5}
                          textAnchor="middle"
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {node.id}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Visit Order */}
                {visitOrder.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Visit Order:</h3>
                    <div className="flex flex-wrap gap-2">
                      {visitOrder.map((nodeId, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                        >
                          {index + 1}. {nodeId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <Button onClick={handlePlay} disabled={isPlaying}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Traversal
                  </Button>
                  
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
                  Generate New Graph
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Nodes:</span>
                  <span className="font-bold">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Edges:</span>
                  <span className="font-bold">{edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visited:</span>
                  <span className="font-bold">{visitedNodes.size}/{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="font-bold">{currentNode || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">
                    {searchComplete ? 'Complete' : (isPlaying ? 'Running' : 'Ready')}
                  </span>
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
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Unvisited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                  <span className="text-sm">In Queue (BFS)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Visited</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}