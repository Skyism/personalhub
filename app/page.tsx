import Link from 'next/link'
import { DollarSign, Sparkles, Activity } from 'lucide-react'

const modules = [
  {
    href: '/finance',
    icon: DollarSign,
    title: 'Finance',
    description: 'Track expenses, budgets, and wants spending',
    available: true,
  },
  {
    href: '/skincare/routines',
    icon: Sparkles,
    title: 'Skincare',
    description: 'Daily routine tracker',
    available: true,
  },
  {
    icon: Activity,
    title: 'Fitness',
    description: 'Workout and health tracking',
    available: false,
  },
]

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Personal Nexus</h1>
          <p className="text-muted-foreground">
            Modular dashboard for life tracking
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return module.available ? (
              <Link
                key={module.href}
                href={module.href!}
                className="group relative overflow-hidden rounded-lg border p-6 hover:border-primary transition-colors"
              >
                <div className="space-y-2">
                  <Icon className="h-10 w-10 text-primary" />
                  <h2 className="text-2xl font-semibold">{module.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <div
                key={module.title}
                className="relative overflow-hidden rounded-lg border p-6 opacity-60"
              >
                <div className="space-y-2">
                  <Icon className="h-10 w-10" />
                  <h2 className="text-2xl font-semibold">{module.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                  <span className="text-xs text-muted-foreground italic">
                    Coming soon
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
