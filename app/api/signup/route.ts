import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    console.log("Signup attempt for username:", username)

    const client = await clientPromise
    console.log("MongoDB client connected")

    const db = client.db("recipeBook")
    console.log("Database selected")

    const existingUser = await db.collection("users").findOne({ username })
    console.log("Existing user found:", !!existingUser)

    if (existingUser) {
      console.log("Signup failed: Username already exists")
      return NextResponse.json({ message: "Username already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Password hashed")

    const result = await db.collection("users").insertOne({
      username,
      password: hashedPassword,
    })
    console.log("User inserted, ID:", result.insertedId)

    const token = sign({ userId: result.insertedId }, process.env.JWT_SECRET!, { expiresIn: "1d" })
    console.log("JWT token generated")

    const response = NextResponse.json({ message: "User created successfully", username })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day in seconds
    })

    console.log("Signup successful for username:", username)
    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "An error occurred during signup" }, { status: 500 })
  }
}

