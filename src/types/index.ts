export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Algorithm {
  id: string
  name: string
  category: 'sorting' | 'searching' | 'graph' | 'recursion' | 'pathfinding'
  description: string
  timeComplexity: string
  spaceComplexity: string
  codeCpp: string
  codeJava: string
  codeJs: string
}

export interface UserProgress {
  id: string
  userId: string
  algorithmId: string
  completed: boolean
  timeSpent: number
  attempts: number
  lastAttempt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Bookmark {
  id: string
  userId: string
  algorithmId: string
  createdAt: Date
}

export interface PracticeSession {
  id: string
  userId: string
  algorithmId: string
  inputSize: number
  executionTime: number
  completed: boolean
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

export interface VisualizationState {
  isPlaying: boolean
  speed: number
  currentStep: number
  totalSteps: number
  array: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
  pivot?: number
}

export interface AlgorithmStep {
  type: 'compare' | 'swap' | 'partition' | 'complete'
  indices: number[]
  array: number[]
  description: string
}