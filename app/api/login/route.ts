import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    console.log("Login attempt for username:", username)

    const client = await clientPromise
    console.log("MongoDB client connected")

    const db = client.db("recipeBook")
    console.log("Database selected")

    const user = await db.collection("users").findOne({ username })
    console.log("User found:", !!user)

    if (!user) {
      console.log("Login failed: User not found")
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("Login failed: Invalid password")
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set")
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 })
    }

    const token = sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: "1d" })
    console.log("JWT token generated")

    const response = NextResponse.json({ message: "Login successful", username: user.username })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day in seconds
    })

    console.log("Login successful for username:", username)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}

