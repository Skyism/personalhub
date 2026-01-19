'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, DollarSign, Wallet, TrendingUp, Tags } from 'lucide-react'

export default function DesktopNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/finance', label: 'Finance', icon: DollarSign, divider: true },
    { href: '/finance/budgets', label: 'Budgets', icon: Wallet },
    { href: '/finance/wants', label: 'Wants', icon: DollarSign },
    { href: '/finance/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/finance/categories', label: 'Categories', icon: Tags },
  ]

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-background/95 backdrop-blur">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <div key={item.href}>
              {item.divider && <div className="h-px bg-border my-2" />}
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
