'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const breadcrumbLabels: Record<string, string> = {
  '/': 'Home',
  '/finance': 'Finance',
  '/finance/budgets': 'Budgets',
  '/finance/wants': 'Wants Budget',
  '/finance/analytics': 'Analytics',
  '/finance/categories': 'Categories',
}

export default function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null
  }

  // Parse pathname into segments
  const segments = pathname.split('/').filter(Boolean)

  // Build breadcrumb trail
  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const label = breadcrumbLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === segments.length - 1

    return {
      path,
      label,
      isLast,
    }
  })

  return (
    <nav aria-label="Breadcrumbs" className="hidden md:block">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home link - always visible */}
        <li>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {breadcrumbs.map((crumb) => (
          <li key={crumb.path} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {crumb.isLast ? (
              <span aria-current="page" className="font-medium text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
