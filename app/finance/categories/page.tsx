import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CategoryCard from './CategoryCard'
import CreateCategoryForm from './CreateCategoryForm'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', TEMP_USER_ID)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  const hasCategories = categories && categories.length > 0

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/finance/budgets" className="hover:text-blue-600">
              Budgets
            </Link>
            <span>/</span>
            <span className="text-gray-900">Categories</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your spending categories</p>
        </div>

        <div className="mb-6">
          <CreateCategoryForm />
        </div>

        {!hasCategories ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No categories yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first category to organize your spending.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
