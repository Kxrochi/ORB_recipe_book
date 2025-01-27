import Image from "next/image"
import { Clock, User, Calendar, Tag } from "lucide-react"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"
import ImageSlider from "../../components/ImageSlider"
import CommentSection from "../../components/CommentSection"

export default async function RecipePage({ params }: { params: { id: string } }) {
  const client = await clientPromise
  const db = client.db("recipeBook")
  const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(params.id) })

  if (!recipe) {
    return <div>Recipe not found</div>
  }

  const getImageUrls = (imagesString: string): string[] => {
    if (imagesString === "character(0)") return ["/placeholder.svg"]
    if (imagesString.startsWith("c(")) {
      const matches = imagesString.match(/"([^"]+)"/g)
      return matches ? matches.map((url) => url.replace(/"/g, "")) : ["/placeholder.svg"]
    }
    return [imagesString.replace(/"/g, "")]
  }

  const imageUrls = getImageUrls(recipe.Images)

  const formatTime = (time: string) => {
    return time ? time.replace(/^PT/, "") : "N/A"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const parseList = (str: string) => {
    if (!str) return []
    return str
      .replace(/^c\$\$"/, "")
      .replace(/"$$$/, "")
      .split('", "')
      .map((item) => item.trim())
  }

  const ingredients = parseList(recipe.RecipeIngredientParts)
  const quantities = parseList(recipe.RecipeIngredientQuantities)
  const instructions = parseList(recipe.RecipeInstructions)
  const keywords = parseList(recipe.Keywords)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">{recipe.Name}</h1>
      <div className="mb-8 relative h-96">
        <ImageSlider images={imageUrls} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <User className="mr-2" />
          <span>Author: {recipe.AuthorName || "Unknown"}</span>
        </div>
        <div className="flex items-center">
          <Clock className="mr-2" />
          <span>Cook Time: {formatTime(recipe.CookTime)}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2" />
          <span>Published: {formatDate(recipe.DatePublished)}</span>
        </div>
        <div className="flex items-center">
          <Tag className="mr-2" />
          <span>Category: {recipe.RecipeCategory}</span>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc list-inside">
          {ingredients.map((ingredient, index) => (
            <li key={index}>
              {quantities[index] || ""} {ingredient}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal list-inside">
          {instructions.map((instruction, index) => (
            <li key={index} className="mb-2">
              {instruction}
            </li>
          ))}
        </ol>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Nutrition Information</h2>
        <ul className="grid grid-cols-2 gap-2">
          <li>Calories: {recipe.Calories || "N/A"}</li>
          <li>Fat: {recipe.FatContent || "N/A"}g</li>
          <li>Saturated Fat: {recipe.SaturatedFatContent || "N/A"}g</li>
          <li>Cholesterol: {recipe.CholesterolContent || "N/A"}mg</li>
          <li>Sodium: {recipe.SodiumContent || "N/A"}mg</li>
          <li>Carbohydrates: {recipe.CarbohydrateContent || "N/A"}g</li>
          <li>Fiber: {recipe.FiberContent || "N/A"}g</li>
          <li>Sugar: {recipe.SugarContent || "N/A"}g</li>
          <li>Protein: {recipe.ProteinContent || "N/A"}g</li>
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Servings</h2>
        <p>{recipe.RecipeServings || "N/A"}</p>
      </div>
      {keywords.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      <CommentSection recipeId={params.id} />
    </div>
  )
}

