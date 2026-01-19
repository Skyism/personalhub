'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs'

interface TopAppBarProps {
  showBackButton?: boolean
  fallbackHref?: string
  title?: string
}

export default function TopAppBar({
  showBackButton = true,
  fallbackHref = '/',
  title,
}: TopAppBarProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's history to go back to (SSR-safe)
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // No history, use fallback href
      router.push(fallbackHref)
    }
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                aria-label="Go back"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
          </div>
          <Breadcrumbs />
        </div>
      </div>
    </div>
  )
}
