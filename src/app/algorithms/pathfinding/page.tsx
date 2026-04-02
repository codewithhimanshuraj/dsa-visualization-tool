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
  Zap,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

type CellType = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited' | 'visiting' | 'current'

interface Cell {
  row: number
  col: number
  type: CellType
  distance: number
  parent: { row: number; col: number } | null
  f: number // f = g + h (for A*)
  g: number // distance from start
  h: number // heuristic distance to end
}

const ALGORITHMS = {
  dijkstra: {
    name: 'Dijkstra Algorithm',
    complexity: { time: 'O(V²)', space: 'O(V)' },
    description: 'Finds the shortest path from start to end using weighted distances.'
  },
  astar: {
    name: 'A* Algorithm',
    complexity: { time: 'O(V²)', space: 'O(V)' },
    description: 'Uses heuristics to find the shortest path more efficiently.'
  }
}

export default function PathfindingPage() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra')
  const [speed, setSpeed] = useState([50])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDrawingWalls, setIsDrawingWalls] = useState(false)
  const [startPos, setStartPos] = useState({ row: 5, col: 5 })
  const [endPos, setEndPos] = useState({ row: 15, col: 25 })
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null)
  const [pathFound, setPathFound] = useState(false)
  const [pathLength, setPathLength] = useState(0)
  const [visitedCount, setVisitedCount] = useState(0)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  const ROWS = 20
  const COLS = 30

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = []
    for (let row = 0; row < ROWS; row++) {
      const currentRow: Cell[] = []
      for (let col = 0; col < COLS; col++) {
        let type: CellType = 'empty'
        if (row === startPos.row && col === startPos.col) type = 'start'
        else if (row === endPos.row && col === endPos.col) type = 'end'
        
        currentRow.push({
          row,
          col,
          type,
          distance: Infinity,
          parent: null,
          f: 0,
          g: 0,
          h: 0
        })
      }
      newGrid.push(currentRow)
    }
    return newGrid
  }, [startPos, endPos])

  const resetPathfinding = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentCell(null)
    setPathFound(false)
    setPathLength(0)
    setVisitedCount(0)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    // Reset grid but keep walls and start/end positions
    setGrid(prev => prev.map(row => 
      row.map(cell => ({
        ...cell,
        type: cell.type === 'path' || cell.type === 'visited' || cell.type === 'visiting' || cell.type === 'current'
          ? 'empty'
          : cell.type,
        distance: Infinity,
        parent: null,
        f: 0,
        g: 0,
        h: 0
      }))
    ))
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setGrid(initializeGrid())
    resetPathfinding()
  }, [initializeGrid])
  /* eslint-enable react-hooks/set-state-in-effect */

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Get neighbors of a cell
  const getNeighbors = (row: number, col: number): { row: number; col: number }[] => {
    const neighbors = []
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // Up, Down, Left, Right
      [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
    ]

    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc
      if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
        if (grid[newRow] && grid[newRow][newCol] && grid[newRow][newCol].type !== 'wall') {
          neighbors.push({ row: newRow, col: newCol })
        }
      }
    }
    return neighbors
  }

  // Calculate heuristic (Manhattan distance)
  const heuristic = (row: number, col: number): number => {
    return Math.abs(row - endPos.row) + Math.abs(col - endPos.col)
  }

  // Reconstruct path from end to start
  const reconstructPath = (endCell: Cell): Cell[] => {
    const path: Cell[] = []
    let current: Cell | null = endCell
    
    while (current && !(current.row === startPos.row && current.col === startPos.col)) {
      path.unshift(current)
      current = current.parent ? grid[current.parent.row][current.parent.col] : null
    }
    
    return path
  }

  // Dijkstra's Algorithm
  const dijkstra = async () => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    const unvisited: Cell[] = []
    let visited = 0

    // Initialize
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (newGrid[row][col].type !== 'wall') {
          unvisited.push(newGrid[row][col])
        }
      }
    }

    // Set start distance
    const startCell = newGrid[startPos.row][startPos.col]
    startCell.distance = 0

    while (unvisited.length > 0 && isPlaying && !isPaused) {
      // Find cell with minimum distance
      unvisited.sort((a, b) => a.distance - b.distance)
      const current = unvisited.shift()!
      
      if (current.distance === Infinity) break

      // Mark as visiting
      setCurrentCell({ row: current.row, col: current.col })
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visiting'
      }
      setGrid([...newGrid])
      visited++
      setVisitedCount(visited)
      
      await sleep(101 - speed[0])

      // Check if we reached the end
      if (current.row === endPos.row && current.col === endPos.col) {
        const path = reconstructPath(current)
        setPathLength(path.length)
        
        // Animate path
        for (const cell of path) {
          if (!isPlaying || isPaused) break
          if (cell.type !== 'end') {
            cell.type = 'path'
            setGrid([...newGrid])
            await sleep(50)
          }
        }
        
        setPathFound(true)
        setIsPlaying(false)
        return
      }

      // Mark as visited
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visited'
      }

      // Update neighbors
      const neighbors = getNeighbors(current.row, current.col)
      for (const neighbor of neighbors) {
        const neighborCell = newGrid[neighbor.row][neighbor.col]
        const altDistance = current.distance + 1
        
        if (altDistance < neighborCell.distance) {
          neighborCell.distance = altDistance
          neighborCell.parent = { row: current.row, col: current.col }
        }
      }
      
      setGrid([...newGrid])
    }

    setPathFound(false)
    setIsPlaying(false)
  }

  // A* Algorithm
  const aStar = async () => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    const openSet: Cell[] = []
    const closedSet = new Set<string>()
    let visited = 0

    // Initialize
    const startCell = newGrid[startPos.row][startPos.col]
    startCell.g = 0
    startCell.h = heuristic(startCell.row, startCell.col)
    startCell.f = startCell.h
    openSet.push(startCell)

    while (openSet.length > 0 && isPlaying && !isPaused) {
      // Find cell with minimum f score
      openSet.sort((a, b) => a.f - b.f)
      const current = openSet.shift()!
      
      const currentKey = `${current.row},${current.col}`
      if (closedSet.has(currentKey)) continue
      closedSet.add(currentKey)

      // Mark as visiting
      setCurrentCell({ row: current.row, col: current.col })
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visiting'
      }
      setGrid([...newGrid])
      visited++
      setVisitedCount(visited)
      
      await sleep(101 - speed[0])

      // Check if we reached the end
      if (current.row === endPos.row && current.col === endPos.col) {
        const path = reconstructPath(current)
        setPathLength(path.length)
        
        // Animate path
        for (const cell of path) {
          if (!isPlaying || isPaused) break
          if (cell.type !== 'end') {
            cell.type = 'path'
            setGrid([...newGrid])
            await sleep(50)
          }
        }
        
        setPathFound(true)
        setIsPlaying(false)
        return
      }

      // Mark as visited
      if (current.type !== 'start' && current.type !== 'end') {
        current.type = 'visited'
      }

      // Update neighbors
      const neighbors = getNeighbors(current.row, current.col)
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`
        if (closedSet.has(neighborKey)) continue

        const neighborCell = newGrid[neighbor.row][neighbor.col]
        const tentativeG = current.g + 1

        if (tentativeG < neighborCell.g || neighborCell.g === 0) {
          neighborCell.parent = { row: current.row, col: current.col }
          neighborCell.g = tentativeG
          neighborCell.h = heuristic(neighbor.row, neighbor.col)
          neighborCell.f = neighborCell.g + neighborCell.h

          if (!openSet.includes(neighborCell)) {
            openSet.push(neighborCell)
          }
        }
      }
      
      setGrid([...newGrid])
    }

    setPathFound(false)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    resetPathfinding()
    setIsPlaying(true)
    setIsPaused(false)
    
    if (selectedAlgorithm === 'dijkstra') {
      dijkstra()
    } else if (selectedAlgorithm === 'astar') {
      aStar()
    }
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    resetPathfinding()
    setGrid(initializeGrid())
  }

  const handleCellClick = (row: number, col: number) => {
    if (isPlaying) return
    
    const newGrid = [...grid]
    const cell = newGrid[row][col]
    
    if (cell.type === 'start' || cell.type === 'end') return
    
    if (isDrawingWalls) {
      cell.type = cell.type === 'wall' ? 'empty' : 'wall'
    } else {
      // Clear previous path/visited
      newGrid.forEach(r => r.forEach(c => {
        if (c.type === 'path' || c.type === 'visited' || c.type === 'visiting') {
          c.type = 'empty'
        }
      }))
      
      // Set new start or end
      if (cell.type === 'empty') {
        // Clear old start
        newGrid[startPos.row][startPos.col].type = 'empty'
        setStartPos({ row, col })
        cell.type = 'start'
      }
    }
    
    setGrid(newGrid)
  }

  const getCellColor = (type: CellType) => {
    switch (type) {
      case 'start': return 'bg-green-500'
      case 'end': return 'bg-red-500'
      case 'wall': return 'bg-gray-800'
      case 'path': return 'bg-yellow-400'
      case 'visiting': return 'bg-blue-400'
      case 'visited': return 'bg-blue-200'
      case 'current': return 'bg-purple-500'
      default: return 'bg-white'
    }
  }

  const algorithm = ALGORITHMS[selectedAlgorithm as keyof typeof ALGORITHMS]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pathfinding Visualizer</h1>
            <p className="text-muted-foreground">
              Watch pathfinding algorithms find the optimal route through obstacles
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Grid Visualizer */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {algorithm.name}
                </CardTitle>
                <CardDescription>{algorithm.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Instructions */}
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Instructions:</strong> Click "Draw Walls" to toggle wall drawing mode, 
                    then click on the grid to add/remove walls. Click "Find Path" to start the algorithm.
                  </p>
                </div>

                {/* Grid */}
                <div className="mb-6 overflow-auto">
                  <div className="inline-block border-2 border-gray-300">
                    {grid.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex">
                        {row.map((cell, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-6 h-6 border border-gray-200 cursor-pointer transition-colors duration-200 ${getCellColor(cell.type)}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            onMouseEnter={(e) => {
                              if (e.buttons === 1 && isDrawingWalls) {
                                handleCellClick(rowIndex, colIndex)
                              }
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result */}
                {pathFound && (
                  <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
                    <p>✅ Path found! Length: {pathLength} steps</p>
                  </div>
                )}

                {!pathFound && isPlaying === false && visitedCount > 0 && (
                  <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
                    <p>❌ No path found</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <Button
                    onClick={handlePlay}
                    disabled={isPlaying}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Find Path
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handlePause}
                    disabled={!isPlaying || isPaused}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isPlaying}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                    variant={isDrawingWalls ? "default" : "outline"}
                    onClick={() => setIsDrawingWalls(!isDrawingWalls)}
                    disabled={isPlaying}
                  >
                    {isDrawingWalls ? "Stop Drawing" : "Draw Walls"}
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
                  Clear Grid
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
                  <span>Grid Size:</span>
                  <span className="font-bold">{ROWS}×{COLS}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visited Cells:</span>
                  <span className="font-bold">{visitedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Path Length:</span>
                  <span className="font-bold">{pathLength || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">
                    {pathFound ? 'Found' : (isPlaying ? 'Searching' : 'Ready')}
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
                  <div className="w-4 h-4 bg-green-500 border border-gray-300"></div>
                  <span className="text-sm">Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 border border-gray-300"></div>
                  <span className="text-sm">End</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 border border-gray-300"></div>
                  <span className="text-sm">Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 border border-gray-300"></div>
                  <span className="text-sm">Visiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 border border-gray-300"></div>
                  <span className="text-sm">Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 border border-gray-300"></div>
                  <span className="text-sm">Path</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}