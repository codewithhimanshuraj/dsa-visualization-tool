"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User } from '@/types'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const data = await response.json()
          set({ user: data.user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async (email: string, password: string, name?: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          })

          if (!response.ok) {
            throw new Error('Signup failed')
          }

          const data = await response.json()
          set({ user: data.user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null })
        // Also clear the token if you're using one
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)