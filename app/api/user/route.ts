import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
    const client = await clientPromise
    const db = client.db("recipeBook")
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ username: user.username })
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

