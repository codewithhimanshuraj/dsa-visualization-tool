"use client"

import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"

interface MainLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {showSidebar && (
          <aside className="hidden md:block w-64 border-r bg-muted/40">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}