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

    const client = await clientPromise
    const db = client.db("recipeBook")
    const comments = await db
      .collection("comments")
      .find({ recipeId: new ObjectId(recipeId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error in GET /api/comments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { recipeId, content } = await request.json()

    if (!recipeId || !content) {
      return NextResponse.json({ message: "Recipe ID and content are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("recipeBook")
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const newComment = {
      userId: user._id,
      username: user.username,
      recipeId: new ObjectId(recipeId),
      content,
      createdAt: new Date(),
    }

    await db.collection("comments").insertOne(newComment)

    return NextResponse.json({ message: "Comment added successfully" })
  } catch (error) {
    console.error("Error in POST /api/comments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

