"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

interface Comment {
  _id: string
  username: string
  content: string
  createdAt: string
}

export default function CommentSection({ recipeId }: { recipeId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchComments()
    fetchLikes()
    checkLoginStatus()
  }, [])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?recipeId=${recipeId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      } else {
        console.error("Failed to fetch comments")
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/likes?recipeId=${recipeId}`)
      if (response.ok) {
        const data = await response.json()
        setLikes(data.likes)
        setIsLiked(data.isLiked)
      } else {
        console.error("Failed to fetch likes")
      }
    } catch (error) {
      console.error("Error fetching likes:", error)
    }
  }

  const checkLoginStatus = async () => {
    const response = await fetch("/api/user")
    setIsLoggedIn(response.ok)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, content: newComment }),
      })
      if (response.ok) {
        setNewComment("")
        await fetchComments()
      } else {
        const errorData = await response.json()
        console.error("Failed to post comment:", errorData.message)
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    }
  }

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      })
      if (response.ok) {
        await fetchLikes()
      } else {
        console.error("Failed to update like")
      }
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>
      <div className="flex items-center mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-gray-500"} hover:text-red-600`}
        >
          <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
          <span>{likes} Likes</span>
        </button>
      </div>
      <form onSubmit={handleSubmitComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          placeholder={isLoggedIn ? "Add a comment..." : "Please log in to comment"}
          disabled={!isLoggedIn}
        />
        <button
          type="submit"
          className="mt-2 bg-emerald-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          disabled={!isLoggedIn || !newComment.trim()}
        >
          Post Comment
        </button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{comment.username}</span>
              <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

