import BottomNav from './components/BottomNav'

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pb-20 lg:pb-0">
        {children}
      </div>
      <BottomNav />
    </>
  )
}
