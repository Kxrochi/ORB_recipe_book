import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "Name"
    const category = searchParams.get("category") || ""

    const client = await clientPromise
    const db = client.db("recipeBook")

    const query: any = {
      Name: search ? { $regex: search, $options: "i" } : { $exists: true, $ne: "" },
      Images: { $exists: true, $ne: "", $ne: "character(0)" },
      Description: { $exists: true, $ne: "" },
      CookTime: { $exists: true, $ne: "" },
      RecipeServings: { $exists: true, $ne: null },
      AuthorName: { $exists: true },
    }

    if (category) {
      query.RecipeCategory = category
    }

    const total = await db.collection("recipes").countDocuments(query)

    const recipes = await db
      .collection("recipes")
      .find(query)
      .sort({ [sort]: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      recipes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 })
  }
}

