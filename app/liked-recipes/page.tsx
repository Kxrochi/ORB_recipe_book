"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LikedRecipe {
  _id: string
  Name: string
  Description: string
}

export default function LikedRecipesPage() {
  const [likedRecipes, setLikedRecipes] = useState<LikedRecipe[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      const response = await fetch("/api/liked-recipes")
      if (response.ok) {
        const data = await response.json()
        setLikedRecipes(data)
      } else {
        router.push("/login")
      }
    }
    fetchLikedRecipes()
  }, [router])

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Liked Recipes</h1>
      {likedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {likedRecipes.map((recipe) => (
            <div key={recipe._id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/recipes/${recipe._id}`} className="text-emerald-500 hover:text-emerald-600">
                  {recipe.Name}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{recipe.Description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">You haven't liked any recipes yet.</p>
      )}
    </div>
  )
}

