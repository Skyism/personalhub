'use client'

import { useRouter } from 'next/navigation'

type YearSelectorProps = {
  selectedYear: number
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - i)

export default function YearSelector({ selectedYear }: YearSelectorProps) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value
    router.push(`/finance/analytics/yearly?year=${year}`)
  }

  return (
    <div className="relative">
      <select
        value={selectedYear}
        onChange={handleChange}
        className="appearance-none w-full min-w-[120px] px-4 py-3 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground text-base cursor-pointer"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
