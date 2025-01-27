"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserProfile {
  username: string
  bio: string
  likedRecipes: Array<{ _id: string; Name: string }>
  comments: Array<{ _id: string; content: string; recipeName: string; createdAt: string }>
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setBio(data.bio || "")
      } else {
        router.push("/login")
      }
    }
    fetchProfile()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    })
    if (response.ok) {
      setProfile((prev) => (prev ? { ...prev, bio } : null))
      setIsEditing(false)
    }
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2">{profile.username}</h2>
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="mb-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              rows={4}
            />
            <div className="mt-2">
              <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded mr-2">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300">{profile.bio || "No bio yet."}</p>
            <button onClick={() => setIsEditing(true)} className="mt-2 text-emerald-500 hover:text-emerald-600">
              Edit Bio
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Liked Recipes</h2>
        {profile.likedRecipes.length > 0 ? (
          <ul className="space-y-2">
            {profile.likedRecipes.map((recipe) => (
              <li key={recipe._id}>
                <Link href={`/recipes/${recipe._id}`} className="text-emerald-500 hover:text-emerald-600">
                  {recipe.Name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No liked recipes yet.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Comments</h2>
        {profile.comments.length > 0 ? (
          <ul className="space-y-4">
            {profile.comments.map((comment) => (
              <li key={comment._id} className="border-b pb-4 last:border-b-0">
                <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>On recipe: </span>
                  <Link href={`/recipes/${comment._id}`} className="text-emerald-500 hover:text-emerald-600">
                    {comment.recipeName}
                  </Link>
                  <span className="ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No comments yet.</p>
        )}
      </div>
    </div>
  )
}

