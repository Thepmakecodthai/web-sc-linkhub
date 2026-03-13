"use client"

import { useState, useEffect } from "react"
import { HiHeart } from "react-icons/hi2"

interface LikeButtonProps {
  targetUserId: string
  initialLikes: number
  isLoggedIn: boolean
}

export default function LikeButton({ targetUserId, initialLikes, isLoggedIn }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`/api/user/${targetUserId}/like/status`)
        .then(res => res.json())
        .then(data => setIsLiked(data.hasLiked))
        .catch(err => console.error('Error fetching like status:', err))
    }
  }, [targetUserId, isLoggedIn])

  const handleLike = async () => {
    if (!isLoggedIn || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/${targetUserId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const newIsLiked = !isLiked
        const newLikes = isLiked ? likes - 1 : likes + 1
        setIsLiked(newIsLiked)
        setLikes(newLikes)
        
        // Dispatch custom event to update other components
        window.dispatchEvent(new CustomEvent('likeUpdated', {
          detail: { targetUserId, liked: newIsLiked, likesCount: newLikes }
        }))
      } else {
        console.error('Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2 text-white bg-red-500 p-4 rounded-lg border-4 border-yellow-400">
        <HiHeart className="w-8 h-8" />
        <span className="font-bold text-xl">❤️ Likes: {likes}</span>
        <span className="text-sm">(Not logged in)</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xl border-4 ${
        isLiked
          ? 'bg-red-500 text-white border-pink-400'
          : 'bg-green-500 text-white border-blue-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
    >
      <HiHeart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} />
      <span>{isLiked ? '❤️ Liked' : '👍 Like'}: {likes}</span>
      {isLoading && <span className="text-sm">(Loading...)</span>}
    </button>
  )
}