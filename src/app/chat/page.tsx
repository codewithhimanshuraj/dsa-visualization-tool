"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MainLayout } from '@/components/layout/main-layout'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  BarChart3,
  Code2,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const DSA_TOPICS = [
  'Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs',
  'Sorting Algorithms', 'Searching Algorithms', 'Dynamic Programming',
  'Recursion', 'Backtracking', 'Greedy Algorithms', 'Divide and Conquer'
]

const SAMPLE_QUESTIONS = [
  "What is the time complexity of Quick Sort?",
  "How does Binary Search work?",
  "Explain Dynamic Programming with an example",
  "What's the difference between BFS and DFS?",
  "How do you detect a cycle in a linked list?",
  "What is memoization?",
  "Explain the concept of Big O notation",
  "How does Dijkstra's algorithm work?"
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your DSA learning assistant. I can help you understand algorithms, data structures, time complexity, and much more. What would you like to learn about today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response generation
    const message = userMessage.toLowerCase()
    
    // Check for specific topics
    if (message.includes('quick sort') || message.includes('quicksort')) {
      return `**Quick Sort** is a highly efficient sorting algorithm that uses a divide-and-conquer strategy.

**How it works:**
1. Choose a 'pivot' element from the array
2. Partition the array so that elements smaller than pivot come before it, and larger elements come after
3. Recursively apply the above steps to the sub-arrays

**Time Complexity:**
- Best Case: O(n log n) - when pivot always divides array into equal halves
- Average Case: O(n log n)
- Worst Case: O(n²) - when pivot is always the smallest or largest element

**Space Complexity:** O(log n) for the recursion stack

**Key Points:**
- In-place algorithm (doesn't require extra space)
- Not stable (relative order of equal elements may change)
- Generally faster in practice than other O(n log n) algorithms

Would you like me to explain any specific part in more detail or show you a visual demonstration?`
    }
    
    if (message.includes('binary search')) {
      return `**Binary Search** is an efficient algorithm for finding an item in a **sorted** array.

**How it works:**
1. Compare the target value with the middle element
2. If they match, return the middle position
3. If target < middle, search the left half
4. If target > middle, search the right half
5. Repeat until found or array is exhausted

**Time Complexity:**
- Best Case: O(1) - when middle element is the target
- Average Case: O(log n)
- Worst Case: O(log n)

**Space Complexity:** O(1) for iterative, O(log n) for recursive

**Example:**
Array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
Target: 23

1. Middle = 16 (index 4), 23 > 16 → search right half
2. Middle = 56 (index 7), 23 < 56 → search left half
3. Middle = 23 (index 5) → Found!

**Important:** Binary search only works on **sorted** arrays!

Try our visualizer to see it in action!`
    }
    
    if (message.includes('dynamic programming') || message.includes('dp')) {
      return `**Dynamic Programming (DP)** is a method for solving complex problems by breaking them down into simpler subproblems.

**Core Principles:**
1. **Optimal Substructure:** The optimal solution can be constructed from optimal solutions of subproblems
2. **Overlapping Subproblems:** Same subproblems are solved multiple times

**Two Approaches:**

**1. Top-Down (Memoization):**
- Start with the main problem
- Recursively solve subproblems
- Store results to avoid recomputation

**2. Bottom-Up (Tabulation):**
- Start with the smallest subproblems
- Build up to the main problem
- Fill a table/dp array

**Classic Examples:**
- Fibonacci Sequence
- Knapsack Problem
- Longest Common Subsequence
- Coin Change Problem

**Fibonacci Example:**
\`\`\`javascript
// Without DP (exponential)
fib(n) = fib(n-1) + fib(n-2)

// With DP (linear)
dp[0] = 0, dp[1] = 1
for i = 2 to n:
    dp[i] = dp[i-1] + dp[i-2]
\`\`\`

DP trades space for time, often reducing exponential complexity to polynomial!`
    }
    
    if (message.includes('bfs') || message.includes('dfs')) {
      return `**BFS vs DFS** - Both are graph traversal algorithms with different strategies:

**Breadth-First Search (BFS):**
- **Strategy:** Explore level by level (all neighbors first)
- **Data Structure:** Queue (FIFO)
- **Memory:** More memory intensive (stores all nodes at current level)
- **Use Cases:**
  - Shortest path in unweighted graphs
  - Level-order traversal
  - Finding connected components

**Depth-First Search (DFS):**
- **Strategy:** Explore as deep as possible before backtracking
- **Data Structure:** Stack (LIFO) or recursion
- **Memory:** Less memory (only stores path)
- **Use Cases:**
  - Topological sorting
  - Detecting cycles
  - Maze solving
  - Finding connected components

**Comparison:**
| Aspect | BFS | DFS |
|--------|-----|-----|
| Order | Level by level | Depth first |
| Memory | O(b^d) | O(bd) |
| Optimal | Yes (unweighted) | No |
| Complete | Yes | Yes |
| Path | Shortest | Any path |

Where b = branching factor, d = depth

Both have same time complexity: O(V + E) where V = vertices, E = edges`
    }
    
    if (message.includes('big o') || message.includes('complexity')) {
      return `**Big O Notation** describes how algorithm runtime/space grows with input size.

**Common Complexities (Best to Worst):**

**O(1) - Constant:**
- Same time regardless of input size
- Example: Array access, hash table lookup

**O(log n) - Logarithmic:**
- Cuts problem size in half each step
- Example: Binary search

**O(n) - Linear:**
- Proportional to input size
- Example: Linear search, simple loop

**O(n log n) - Linearithmic:**
- Efficient sorting algorithms
- Example: Merge sort, quick sort (average)

**O(n²) - Quadratic:**
- Nested loops over input
- Example: Bubble sort, insertion sort

**O(2^n) - Exponential:**
- Doubles with each addition
- Example: Recursive Fibonacci, subset generation

**O(n!) - Factorial:**
- Extremely fast growth
- Example: Permutations, traveling salesman

**Real-World Impact:**
- For n = 1,000,000:
  - O(n): ~1 second
  - O(n log n): ~20 seconds  
  - O(n²): ~11 days
  - O(2^n): ~10^300,000 years!

**Key Insight:** Algorithm choice matters more than hardware for large datasets!`
    }
    
    if (message.includes('linked list') || message.includes('cycle')) {
      return `**Detecting Cycles in Linked Lists** - A classic problem with multiple solutions:

**Problem:** Given a linked list, determine if it has a cycle (loop).

**Solution 1: Hash Set (O(n) time, O(n) space)**
\`\`\`javascript
while (node != null):
    if (visited.contains(node)):
        return true  // Cycle found
    visited.add(node)
    node = node.next
return false
\`\`\`

**Solution 2: Floyd's Tortoise and Hare (O(n) time, O(1) space)**
\`\`\`javascript
slow = head
fast = head

while (fast != null && fast.next != null):
    slow = slow.next        // Move 1 step
    fast = fast.next.next   // Move 2 steps
    
    if (slow == fast):
        return true  // Cycle found
return false
\`\`\`

**Why Floyd's Algorithm Works:**
- Fast pointer moves twice as fast as slow
- If there's a cycle, fast will eventually "lap" slow
- Like two runners on a circular track - faster one catches slower one

**Finding Cycle Start:**
After detecting a cycle:
1. Reset slow to head
2. Move both pointers 1 step at a time
3. They meet at cycle start

**Time & Space:**
- Floyd's: O(n) time, O(1) space ✅
- Hash Set: O(n) time, O(n) space ❌

This is why interviewers love this problem - elegant O(1) space solution!`
    }
    
    // Default response
    return `That's a great question about Data Structures and Algorithms! Let me help you understand this concept better.

**Key Points to Remember:**
- Understanding time and space complexity is crucial
- Practice with visualizations helps build intuition
- Start with the basics before moving to advanced topics

**Related Topics You Might Find Interesting:**
- Algorithm complexity analysis
- Data structure trade-offs
- Problem-solving patterns
- Common interview questions

**Would you like me to:**
1. Explain a specific algorithm in detail?
2. Help you understand time complexity?
3. Show you how to approach a particular problem?
4. Recommend learning resources?

Feel free to ask me anything about DSA - from basic concepts to advanced algorithms! I'm here to help you master these fundamental computer science topics.`
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = await generateResponse(input)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleQuestionClick = (question: string) => {
    setInput(question)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DSA Learning Assistant</h1>
            <p className="text-muted-foreground">
              Get instant help with algorithms, data structures, and problem-solving
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
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask me anything about Data Structures & Algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about algorithms, data structures, complexity..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SAMPLE_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left h-auto p-2 text-sm whitespace-normal"
                    onClick={() => handleQuestionClick(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Popular Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {DSA_TOPICS.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs cursor-pointer hover:bg-secondary/80"
                      onClick={() => setInput(`Tell me about ${topic}`)}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Learning Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">💡 Pro Tip</p>
                  <p className="text-blue-700">
                    Try visualizing algorithms on our interactive visualizers to build intuition!
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">📚 Study Strategy</p>
                  <p className="text-green-700">
                    Focus on understanding patterns rather than memorizing solutions.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-900">🎯 Practice</p>
                  <p className="text-purple-700">
                    Start with simple problems and gradually increase difficulty.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}