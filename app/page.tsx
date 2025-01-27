import Link from "next/link"
import RecipeCard from "./components/RecipeCard"
import clientPromise from "../lib/mongodb"

export default async function Home() {
  const client = await clientPromise
  const db = client.db("recipeBook")

  const featuredRecipes = await db
    .collection("recipes")
    .aggregate([
      {
        $match: {
          Name: { $exists: true, $ne: "" },
          Images: { $exists: true, $ne: "", $ne: "character(0)" },
          Description: { $exists: true, $ne: "" },
        },
      },
      { $sample: { size: 6 } },
    ])
    .toArray()

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to ORB</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Discover, create, and share delicious recipes from around the world.
        </p>
        <Link
          href="/recipes"
          className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Explore All Recipes
        </Link>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Featured Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe._id.toString()} {...recipe} />
          ))}
        </div>
      </section>
    </div>
  )
}

