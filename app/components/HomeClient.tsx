"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { HiArrowRight, HiMagnifyingGlass, HiHeart } from "react-icons/hi2" // เพิ่ม HiHeart

interface Link {
  id: string
  title: string
  url: string
  description: string | null
}

interface User {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  bio: string | null
  links: Link[]
  likes: number      // เพิ่ม likes
  createdAt?: string
}

function getUserProfileUrl(user: User): string {
  if (user.username) {
    return `/${user.username}`
  }
  return `/user/${user.id}`
}

interface HomeClientProps {
  users: User[]
  session: any
}

export default function HomeClient({ users, session }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "mostLikes">("newest") // เปลี่ยนชื่อจาก mostLinks เป็น mostLikes

  const filteredUsers = useMemo(() => {
    let filtered = users

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          (user.name?.toLowerCase().includes(query)) ||
          (user.username?.toLowerCase().includes(query)) ||
          (user.email.toLowerCase().includes(query))
      )
    }

    // Sorting (ข้อ 1: แก้ไข Logic การเรียงลำดับตาม Like)
    if (sortBy === "mostLikes") {
      filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    }

    return filtered
  }, [users, searchQuery, sortBy])

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 text-base placeholder-gray-500 transition"
            placeholder="Search creators by name, username, or email..."
          />
        </div>

        {/* ข้อ 1: เปลี่ยนปุ่ม Most Links เป็น Most Likes */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sortBy === "newest"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("mostLikes")}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              sortBy === "mostLikes"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <HiHeart className={sortBy === "mostLikes" ? "text-white" : "text-pink-500"} />
            Most Likes
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm">
          {filteredUsers.length} creator{filteredUsers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Users Grid */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No creators found" : "No users yet"}
            </p>
          </div>
        ) : (
          <>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* ข้อ 2: ปรับรูปโปรไฟล์ (เปลี่ยน rounded-full เป็น rounded-2xl เพื่อให้เป็นสี่เหลี่ยมมุมมน) */}
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border-3 border-blue-200 group-hover:border-blue-400 transition shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:shadow-lg transition">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <Link href={getUserProfileUrl(user)} className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition block">
                        {user.name || "Creator"}
                      </Link>
                      <p className="text-sm text-gray-500">{user.username ? `@${user.username}` : "No username set"}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* ข้อ 1: แสดงจำนวน Like แทนจำนวน Link (หรือแสดงทั้งคู่) */}
                  <div className="text-right flex-shrink-0 flex gap-2">
                    <div className="bg-pink-50 group-hover:bg-pink-100 px-3 py-2 rounded-lg transition border border-pink-100">
                      <p className="text-sm font-bold text-pink-600 flex items-center justify-end gap-1">
                        <HiHeart className="w-3 h-3" />
                        {user.likes || 0}
                      </p>
                      <p className="text-[10px] text-pink-500 uppercase font-semibold">Likes</p>
                    </div>
                    <div className="bg-blue-50 group-hover:bg-blue-100 px-3 py-2 rounded-lg transition border border-blue-100">
                      <p className="text-sm font-bold text-blue-600">{user.links.length}</p>
                      <p className="text-[10px] text-blue-500 uppercase font-semibold">Links</p>
                    </div>
                  </div>
                </div>

                {/* ส่วนอื่นๆ คงเดิม... */}
                {user.links.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {user.links.slice(0, 2).map((link) => (
                      <div key={link.id} className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900 truncate">{link.title}</p>
                        <p className="text-xs text-gray-500 truncate">{link.url}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={getUserProfileUrl(user)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group/btn"
                  >
                    View Profile
                    <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}