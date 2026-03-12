"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  bio: string | null
}

interface UserLink {
  id: string
  title: string
  url: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<UserLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadProfile()
    }
  }, [session])

  const loadProfile = async () => {
    try {
      const [profileRes, linksRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/link"),
      ])

      if (profileRes.ok) {
        const userData = await profileRes.json()
        setUser(userData)
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json()
        setLinks(linksData)
      }
    } catch (err) {
      console.error("Failed to load profile:", err)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="max-w-2xl mx-auto p-6 text-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p>Unable to load profile</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
            title="Back to previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 text-center">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || "Profile"}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-gray-600 mb-2">@{user.username}</p>
          <p className="text-sm text-gray-500 mb-4">{user.email}</p>
          {user.bio && <p className="text-gray-700 mb-6 leading-relaxed max-w-md mx-auto">{user.bio}</p>}

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Edit Profile
            </Link>
            {user.username && (
              <a
                href={`/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-medium transition"
              >
                View Public Profile
              </a>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Links</h2>

          {links.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-4">No links yet</p>
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Add Links
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all hover:scale-105 transform"
                >
                  <p className="font-bold text-gray-900 text-lg">{link.title}</p>
                  <p className="text-sm text-gray-600 truncate mt-1">{link.url}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
