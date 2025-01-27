"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface RecipeCardProps {
  _id: string
  Name: string
  Images: string
  Description: string
  CookTime: string
  RecipeServings: number
  AuthorName: string
}

export default function RecipeCard({
  _id,
  Name,
  Images,
  Description,
  CookTime,
  RecipeServings,
  AuthorName,
}: RecipeCardProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getImageUrl = (images: string): string => {
    if (images === "character(0)") return "/placeholder.svg"
    if (images.startsWith("c(")) {
      const matches = images.match(/"([^"]+)"/g)
      return matches && matches.length > 0 ? matches[0].replace(/"/g, "") : "/placeholder.svg"
    }
    return images.replace(/"/g, "") || "/placeholder.svg"
  }

  const imageUrl = getImageUrl(Images)

  const formatTime = (time: string) => {
    return time ? time.replace(/^PT/, "") : "N/A"
  }

  if (!isClient) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-48">
          <Image src={imageUrl || "/placeholder.svg"} alt={Name} layout="fill" objectFit="cover" />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{Name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">By {AuthorName || "Unknown"}</p>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{Description}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" whileHover={{ scale: 1.05 }}>
      <Link href={`/recipes/${_id}`}>
        <div className="relative h-48">
          <Image src={imageUrl || "/placeholder.svg"} alt={Name} layout="fill" objectFit="cover" />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{Name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">By {AuthorName || "Unknown"}</p>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{Description}</p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Cook Time: {formatTime(CookTime)}</p>
            <p>Servings: {RecipeServings || "N/A"}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

