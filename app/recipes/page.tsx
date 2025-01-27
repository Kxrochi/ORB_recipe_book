import { Suspense } from "react"
import RecipeList from "./recipe-list"
import { Skeleton } from "@/components/ui/skeleton"

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold mb-6">All Recipes</h1>
      <Suspense fallback={<RecipesSkeleton />}>
        <RecipeList />
      </Suspense>
    </div>
  )
}

function RecipesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-48 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        <div className="w-64 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

