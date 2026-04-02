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
  SkipForward,
  Settings,
  Code2,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface ArrayBar {
  value: number
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot'
}

const ALGORITHMS = {
  bubble: {
    name: 'Bubble Sort',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    description: 'Compares adjacent elements and swaps them if they are in wrong order.'
  },
  selection: {
    name: 'Selection Sort',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    description: 'Finds the minimum element and places it at the beginning.'
  },
  insertion: {
    name: 'Insertion Sort',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    description: 'Builds the final sorted array one item at a time.'
  },
  merge: {
    name: 'Merge Sort',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    description: 'Divides the array into halves, sorts them, and merges them back.'
  },
  quick: {
    name: 'Quick Sort',
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    description: 'Picks a pivot element and partitions the array around it.'
  }
}

export default function SortingPage() {
  const [arraySize, setArraySize] = useState([30])
  const [speed, setSpeed] = useState([50])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize array
  const generateRandomArray = useCallback(() => {
    const newArray: ArrayBar[] = []
    for (let i = 0; i < arraySize[0]; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 400) + 10,
        state: 'default'
      })
    }
    return newArray
  }, [arraySize])

  const [array, setArray] = useState<ArrayBar[]>(() => {
    const initialArray: ArrayBar[] = []
    for (let i = 0; i < 30; i++) {
      initialArray.push({
        value: Math.floor(Math.random() * 400) + 10,
        state: 'default'
      })
    }
    return initialArray
  })

  // Bubble Sort Implementation
  const bubbleSort = async () => {
    const arr = [...array]
    const n = arr.length
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isPlaying || isPaused) return
        
        // Highlight comparing elements
        arr[j].state = 'comparing'
        arr[j + 1].state = 'comparing'
        setArray([...arr])
        setComparisons(prev => prev + 1)
        
        await sleep(101 - speed[0])
        
        if (arr[j].value > arr[j + 1].value) {
          // Swap elements
          arr[j].state = 'swapping'
          arr[j + 1].state = 'swapping'
          setArray([...arr])
          
          await sleep(101 - speed[0])
          
          const temp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = temp
          setSwaps(prev => prev + 1)
        }
        
        arr[j].state = 'default'
        arr[j + 1].state = 'default'
        setArray([...arr])
      }
      arr[n - i - 1].state = 'sorted'
      setArray([...arr])
    }
    arr[0].state = 'sorted'
    setArray([...arr])
    setIsPlaying(false)
  }

  // Selection Sort Implementation
  const selectionSort = async () => {
    const arr = [...array]
    const n = arr.length
    
    for (let i = 0; i < n - 1; i++) {
      if (!isPlaying || isPaused) return
      
      let minIdx = i
      arr[i].state = 'pivot'
      
      for (let j = i + 1; j < n; j++) {
        if (!isPlaying || isPaused) return
        
        arr[j].state = 'comparing'
        setArray([...arr])
        setComparisons(prev => prev + 1)
        
        await sleep(101 - speed[0])
        
        if (arr[j].value < arr[minIdx].value) {
          if (minIdx !== i) arr[minIdx].state = 'default'
          minIdx = j
          arr[minIdx].state = 'pivot'
        } else {
          arr[j].state = 'default'
        }
        setArray([...arr])
      }
      
      if (minIdx !== i) {
        arr[i].state = 'swapping'
        arr[minIdx].state = 'swapping'
        setArray([...arr])
        
        await sleep(101 - speed[0])
        
        const temp = arr[i]
        arr[i] = arr[minIdx]
        arr[minIdx] = temp
        setSwaps(prev => prev + 1)
      }
      
      arr[i].state = 'sorted'
      if (minIdx !== i) arr[minIdx].state = 'default'
      setArray([...arr])
    }
    arr[n - 1].state = 'sorted'
    setArray([...arr])
    setIsPlaying(false)
  }

  // Insertion Sort Implementation
  const insertionSort = async () => {
    const arr = [...array]
    const n = arr.length
    
    for (let i = 1; i < n; i++) {
      if (!isPlaying || isPaused) return
      
      const key = arr[i].value
      let j = i - 1
      
      arr[i].state = 'pivot'
      setArray([...arr])
      await sleep(101 - speed[0])
      
      while (j >= 0 && arr[j].value > key) {
        if (!isPlaying || isPaused) return
        
        arr[j].state = 'comparing'
        arr[j + 1].state = 'comparing'
        setArray([...arr])
        setComparisons(prev => prev + 1)
        
        await sleep(101 - speed[0])
        
        arr[j + 1].value = arr[j].value
        arr[j].state = 'swapping'
        setSwaps(prev => prev + 1)
        setArray([...arr])
        
        await sleep(101 - speed[0])
        
        arr[j].state = 'default'
        arr[j + 1].state = 'default'
        j--
      }
      
      arr[j + 1].value = key
      arr[j + 1].state = 'sorted'
      setArray([...arr])
      
      // Mark all elements up to i as sorted
      for (let k = 0; k <= i + 1; k++) {
        arr[k].state = 'sorted'
      }
      setArray([...arr])
    }
    
    setIsPlaying(false)
  }

  // Merge Sort Implementation
  const mergeSort = async () => {
    const arr = [...array]
    
    const merge = async (left: number, mid: number, right: number) => {
      const leftArr = arr.slice(left, mid + 1)
      const rightArr = arr.slice(mid + 1, right + 1)
      
      let i = 0, j = 0, k = left
      
      while (i < leftArr.length && j < rightArr.length) {
        if (!isPlaying || isPaused) return
        
        arr[k].state = 'comparing'
        setArray([...arr])
        setComparisons(prev => prev + 1)
        
        await sleep(101 - speed[0])
        
        if (leftArr[i].value <= rightArr[j].value) {
          arr[k].value = leftArr[i].value
          i++
        } else {
          arr[k].value = rightArr[j].value
          j++
        }
        
        arr[k].state = 'swapping'
        setSwaps(prev => prev + 1)
        setArray([...arr])
        await sleep(101 - speed[0])
        arr[k].state = 'default'
        k++
      }
      
      while (i < leftArr.length) {
        if (!isPlaying || isPaused) return
        arr[k].value = leftArr[i].value
        arr[k].state = 'swapping'
        setArray([...arr])
        await sleep(101 - speed[0])
        arr[k].state = 'default'
        i++
        k++
      }
      
      while (j < rightArr.length) {
        if (!isPlaying || isPaused) return
        arr[k].value = rightArr[j].value
        arr[k].state = 'swapping'
        setArray([...arr])
        await sleep(101 - speed[0])
        arr[k].state = 'default'
        j++
        k++
      }
    }
    
    const mergeSortRecursive = async (left: number, right: number) => {
      if (left < right && isPlaying && !isPaused) {
        const mid = Math.floor((left + right) / 2)
        
        await mergeSortRecursive(left, mid)
        await mergeSortRecursive(mid + 1, right)
        await merge(left, mid, right)
        
        // Mark sorted portion
        for (let i = left; i <= right; i++) {
          arr[i].state = 'sorted'
        }
        setArray([...arr])
      }
    }
    
    await mergeSortRecursive(0, arr.length - 1)
    
    // Mark all as sorted
    for (let i = 0; i < arr.length; i++) {
      arr[i].state = 'sorted'
    }
    setArray([...arr])
    setIsPlaying(false)
  }

  // Quick Sort Implementation
  const quickSort = async () => {
    const arr = [...array]
    
    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high].value
      arr[high].state = 'pivot'
      setArray([...arr])
      
      let i = low - 1
      
      for (let j = low; j < high; j++) {
        if (!isPlaying || isPaused) return i
        
        arr[j].state = 'comparing'
        setArray([...arr])
        setComparisons(prev => prev + 1)
        
        await sleep(101 - speed[0])
        
        if (arr[j].value < pivot) {
          i++
          if (i !== j) {
            arr[i].state = 'swapping'
            arr[j].state = 'swapping'
            setArray([...arr])
            
            await sleep(101 - speed[0])
            
            const temp = arr[i].value
            arr[i].value = arr[j].value
            arr[j].value = temp
            setSwaps(prev => prev + 1)
          }
        }
        
        arr[j].state = 'default'
        if (i >= 0) arr[i].state = 'default'
        setArray([...arr])
      }
      
      // Place pivot in correct position
      i++
      if (i !== high) {
        arr[i].state = 'swapping'
        arr[high].state = 'swapping'
        setArray([...arr])
        
        await sleep(101 - speed[0])
        
        const temp = arr[i].value
        arr[i].value = arr[high].value
        arr[high].value = temp
        setSwaps(prev => prev + 1)
      }
      
      arr[i].state = 'sorted'
      arr[high].state = 'default'
      setArray([...arr])
      
      return i
    }
    
    const quickSortRecursive = async (low: number, high: number) => {
      if (low < high && isPlaying && !isPaused) {
        const pi = await partition(low, high)
        await quickSortRecursive(low, pi - 1)
        await quickSortRecursive(pi + 1, high)
      }
    }
    
    await quickSortRecursive(0, arr.length - 1)
    
    // Mark all as sorted
    for (let i = 0; i < arr.length; i++) {
      arr[i].state = 'sorted'
    }
    setArray([...arr])
    setIsPlaying(false)
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handlePlay = () => {
    setIsPlaying(true)
    setIsPaused(false)
    
    switch (selectedAlgorithm) {
      case 'bubble':
        bubbleSort()
        break
      case 'selection':
        selectionSort()
        break
      case 'insertion':
        insertionSort()
        break
      case 'merge':
        mergeSort()
        break
      case 'quick':
        quickSort()
        break
      default:
        bubbleSort()
    }
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setIsPaused(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    setArray(generateRandomArray())
    setComparisons(0)
    setSwaps(0)
    setCurrentStep(0)
  }

  const getBarColor = (state: ArrayBar['state']) => {
    switch (state) {
      case 'comparing': return 'bg-yellow-500'
      case 'swapping': return 'bg-red-500'
      case 'sorted': return 'bg-green-500'
      case 'pivot': return 'bg-purple-500'
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
            <h1 className="text-3xl font-bold tracking-tight">Sorting Visualizer</h1>
            <p className="text-muted-foreground">
              Watch sorting algorithms in action with step-by-step animations
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
                {/* Visualization Area */}
                <div className="h-96 flex items-end justify-center space-x-1 bg-muted/20 rounded-lg p-4 mb-6">
                  {array.map((bar, index) => (
                    <div
                      key={index}
                      className={`flex-1 ${getBarColor(bar.state)} transition-all duration-300 rounded-t`}
                      style={{ height: `${(bar.value / 410) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <Button 
                    onClick={handlePlay} 
                    disabled={isPlaying && !isPaused}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isPlaying && !isPaused ? 'Running' : 'Start'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handlePause}
                    disabled={!isPlaying || isPaused}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" onClick={handleReset}>
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
                    max={100}
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

                <Button onClick={() => {
                  setArray(generateRandomArray())
                  setComparisons(0)
                  setSwaps(0)
                  setCurrentStep(0)
                }} variant="outline" className="w-full" disabled={isPlaying}>
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
                  <span>Swaps:</span>
                  <span className="font-bold">{swaps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Array Size:</span>
                  <span className="font-bold">{array.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}