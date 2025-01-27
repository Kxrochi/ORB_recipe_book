"use client"

import { useState, useEffect, useCallback } from "react"
import RecipeCard from "../components/RecipeCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function RecipeList() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("Name")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchRecipes = useCallback(async (page: number, search: string, sort: string, cat: string) => {
    try {
      setIsLoading(true)
      setError("")
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        sort,
        category: cat,
      })

      const response = await fetch(`/api/recipes?${params}`)
      if (!response.ok) throw new Error("Failed to fetch recipes")

      const data = await response.json()
      setRecipes((prevRecipes) => (page === 1 ? data.recipes : [...prevRecipes, ...data.recipes]))
      setTotalPages(data.totalPages)
    } catch (err) {
      setError("Failed to load recipes. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecipes(1, searchQuery, sortBy, category)
  }, [searchQuery, sortBy, category, fetchRecipes])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }
    fetchCategories()
  }, [])

  const loadMoreRecipes = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1)
      fetchRecipes(currentPage + 1, searchQuery, sortBy, category)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    setRecipes([])
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
    setRecipes([])
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setCurrentPage(1)
    setRecipes([])
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          className="p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="Name">Sort by Name</option>
          <option value="DatePublished">Sort by Date</option>
        </select>

        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {recipes.length === 0 && !isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? "No recipes found matching your search." : "No recipes available."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id.toString()} {...recipe} />
            ))}
          </div>

          {currentPage < totalPages && (
            <div className="mt-8 flex justify-center">
              <Button onClick={loadMoreRecipes} disabled={isLoading} className="flex items-center gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Load More
              </Button>
            </div>
          )}

          {isLoading && recipes.length === 0 && (
            <div className="flex justify-center mt-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

