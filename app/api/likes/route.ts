import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get("recipeId")

    if (!recipeId) {
      return NextResponse.json({ message: "Recipe ID is required" }, { status: 400 })
    }

    const token = cookies().get("token")?.value
    let userId = null
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
        userId = decoded.userId
      } catch (error) {
        console.error("Error verifying token:", error)
      }
    }

    const client = await clientPromise
    const db = client.db("recipeBook")

    const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(recipeId) })
    if (!recipe) {
      return NextResponse.json({ message: "Recipe not found" }, { status: 404 })
    }

    let isLiked = false
    if (userId) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
      if (user) {
        isLiked = user.likedRecipes?.includes(new ObjectId(recipeId)) || false
      }
    }

    return NextResponse.json({ likes: recipe.likes || 0, isLiked })
  } catch (error) {
    console.error("Error in GET /api/likes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("token")?.value
    let userId = null
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
        userId = decoded.userId
      } catch (error) {
        console.error("Error verifying token:", error)
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { recipeId } = await request.json()

    if (!recipeId) {
      return NextResponse.json({ message: "Recipe ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("recipeBook")
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const recipeObjectId = new ObjectId(recipeId)
    const userLikedRecipes = user.likedRecipes || []
    const isLiked = userLikedRecipes.some((id: ObjectId) => id.equals(recipeObjectId))

    if (isLiked) {
      await db.collection("users").updateOne({ _id: user._id }, { $pull: { likedRecipes: recipeObjectId } })
      await db.collection("recipes").updateOne({ _id: recipeObjectId }, { $inc: { likes: -1 } })
    } else {
      await db.collection("users").updateOne({ _id: user._id }, { $addToSet: { likedRecipes: recipeObjectId } })
      await db.collection("recipes").updateOne({ _id: recipeObjectId }, { $inc: { likes: 1 } })
    }

    const updatedRecipe = await db.collection("recipes").findOne({ _id: recipeObjectId })
    return NextResponse.json({ likes: updatedRecipe?.likes || 0, isLiked: !isLiked })
  } catch (error) {
    console.error("Error in POST /api/likes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

