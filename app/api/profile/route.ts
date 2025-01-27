import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const token = cookies().get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let userId
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      console.error("Error verifying token:", error)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("recipeBook")
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const likedRecipes = await db
      .collection("recipes")
      .find({ _id: { $in: user.likedRecipes || [] } })
      .toArray()
    const comments = await db.collection("comments").find({ userId: user._id }).toArray()

    return NextResponse.json({
      username: user.username,
      bio: user.bio || "",
      likedRecipes: likedRecipes.map((recipe) => ({ _id: recipe._id, Name: recipe.Name })),
      comments: comments.map((comment) => ({
        _id: comment._id,
        content: comment.content,
        recipeName: comment.recipeName,
        createdAt: comment.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error in GET /api/profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = cookies().get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let userId
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      console.error("Error verifying token:", error)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { bio } = await request.json()

    const client = await clientPromise
    const db = client.db("recipeBook")
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { bio } })

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error in PUT /api/profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

