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
  Search,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface ArrayElement {
  value: number
  state: 'default' | 'searching' | 'found' | 'checked'
}

const ALGORITHMS = {
  linear: {
    name: 'Linear Search',
    complexity: { time: 'O(n)', space: 'O(1)' },
    description: 'Sequentially checks each element until the target is found.'
  },
  binary: {
    name: 'Binary Search',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    description: 'Divides the search interval in half repeatedly to find the target.'
  }
}

export default function SearchingPage() {
  const [array, setArray] = useState<ArrayElement[]>([])
  const [arraySize, setArraySize] = useState([20])
  const [speed, setSpeed] = useState([50])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linear')
  const [targetValue, setTargetValue] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [comparisons, setComparisons] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [foundIndex, setFoundIndex] = useState(-1)
  const [searchComplete, setSearchComplete] = useState(false)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize sorted array for binary search
  const generateArray = useCallback(() => {
    const newArray: ArrayElement[] = []
    const start = selectedAlgorithm === 'binary' ? 10 : 1
    const step = selectedAlgorithm === 'binary' ? 5 : 1
    
    for (let i = 0; i < arraySize[0]; i++) {
      newArray.push({
        value: start + (i * step) + Math.floor(Math.random() * 3),
        state: 'default'
      })
    }
    
    // For binary search, ensure array is sorted
    if (selectedAlgorithm === 'binary') {
      newArray.sort((a, b) => a.value - b.value)
    }
    
    return newArray
  }, [arraySize, selectedAlgorithm])

  const [arrayState, setArrayState] = useState<ArrayElement[]>(() => {
    const initialArray: ArrayElement[] = []
    for (let i = 0; i < 20; i++) {
      initialArray.push({
        value: i + 1,
        state: 'default'
      })
    }
    return initialArray
  })

  const resetSearch = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setComparisons(0)
    setCurrentIndex(-1)
    setFoundIndex(-1)
    setSearchComplete(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    // Reset all array elements to default state
    setArrayState(prev => prev.map(el => ({ ...el, state: 'default' })))
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setArrayState(generateArray())
    resetSearch()
  }, [generateArray])
  /* eslint-enable react-hooks/set-state-in-effect */

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Linear Search Implementation
  const linearSearch = async () => {
    const target = parseInt(targetValue)
    if (isNaN(target)) {
      alert('Please enter a valid number')
      return
    }

    const arr = [...arrayState]
    
    for (let i = 0; i < arr.length; i++) {
      if (!isPlaying || isPaused) return
      
      // Reset previous searching state
      if (i > 0) {
        arr[i - 1].state = 'checked'
      }
      
      arr[i].state = 'searching'
      setCurrentIndex(i)
      setArrayState([...arr])
      setComparisons(prev => prev + 1)
      
      await sleep(101 - speed[0])
      
      if (arr[i].value === target) {
        arr[i].state = 'found'
        setFoundIndex(i)
        setArrayState([...arr])
        setSearchComplete(true)
        setIsPlaying(false)
        return
      }
    }
    
    // Mark last element as checked if not found
    if (arr.length > 0) {
      arr[arr.length - 1].state = 'checked'
      setArrayState([...arr])
    }
    
    setSearchComplete(true)
    setIsPlaying(false)
  }

  // Binary Search Implementation
  const binarySearch = async () => {
    const target = parseInt(targetValue)
    if (isNaN(target)) {
      alert('Please enter a valid number')
      return
    }

    const arr = [...arrayState]
    let left = 0
    let right = arr.length - 1
    
    while (left <= right && isPlaying && !isPaused) {
      const mid = Math.floor((left + right) / 2)
      
      // Reset previous states
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].state === 'searching') {
          arr[i].state = 'checked'
        }
      }
      
      arr[mid].state = 'searching'
      setCurrentIndex(mid)
      setArrayState([...arr])
      setComparisons(prev => prev + 1)
      
      await sleep(101 - speed[0])
      
      if (arr[mid].value === target) {
        arr[mid].state = 'found'
        setFoundIndex(mid)
        setArrayState([...arr])
        setSearchComplete(true)
        setIsPlaying(false)
        return
      } else if (arr[mid].value < target) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    
    // Mark current searching element as checked
    if (currentIndex >= 0 && currentIndex < arr.length) {
      arr[currentIndex].state = 'checked'
      setArrayState([...arr])
    }
    
    setSearchComplete(true)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    if (!targetValue) {
      alert('Please enter a target value to search')
      return
    }
    
    resetSearch()
    setIsPlaying(true)
    setIsPaused(false)
    
    if (selectedAlgorithm === 'linear') {
      linearSearch()
    } else if (selectedAlgorithm === 'binary') {
      binarySearch()
    }
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    resetSearch()
    setArrayState(generateArray())
  }

  const getElementColor = (state: ArrayElement['state']) => {
    switch (state) {
      case 'searching': return 'bg-yellow-500'
      case 'found': return 'bg-green-500'
      case 'checked': return 'bg-gray-400'
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
            <h1 className="text-3xl font-bold tracking-tight">Searching Visualizer</h1>
            <p className="text-muted-foreground">
              Watch searching algorithms find elements step-by-step
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
                  <Search className="h-5 w-5" />
                  {algorithm.name}
                </CardTitle>
                <CardDescription>{algorithm.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Target Input */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Search Target:</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter number to search"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      disabled={isPlaying}
                      className="flex-1"
                    />
                    <Button onClick={handlePlay} disabled={isPlaying || !targetValue}>
                      <Play className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Visualization Area */}
                <div className="h-64 flex items-center justify-center space-x-2 bg-muted/20 rounded-lg p-4 mb-6 overflow-x-auto">
                  {arrayState.map((element, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 ${getElementColor(element.state)} text-white font-bold rounded flex items-center justify-center transition-all duration-300`}
                      >
                        {element.value}
                      </div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        {index}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Search Result */}
                {searchComplete && (
                  <div className={`p-4 rounded-lg ${
                    foundIndex >= 0 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {foundIndex >= 0 ? (
                      <p>✅ Found {targetValue} at index {foundIndex}!</p>
                    ) : (
                      <p>❌ {targetValue} not found in the array</p>
                    )}
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePause}
                    disabled={!isPlaying || isPaused}
                  >
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

            {/* Array Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Array Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Array Size: {arraySize[0]}</label>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    max={50}
                    min={10}
                    step={5}
                    className="mt-2"
                    disabled={isPlaying}
                  />
                </div>

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
                  Generate New Array
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
                  <span>Comparisons:</span>
                  <span className="font-bold">{comparisons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Array Size:</span>
                  <span className="font-bold">{arrayState.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Index:</span>
                  <span className="font-bold">{currentIndex >= 0 ? currentIndex : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">
                    {searchComplete ? (foundIndex >= 0 ? 'Found' : 'Not Found') : 'Searching...'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}