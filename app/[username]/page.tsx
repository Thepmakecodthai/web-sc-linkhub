import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  // Trim and validate username
  const cleanUsername = username?.trim().toLowerCase()
  
  if (!cleanUsername) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invalid Profile</h1>
          <p className="text-gray-600 mb-6">
            The profile URL is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }
  
  // Search for user by username (case-insensitive for SQLite)
  const user = await prisma.user.findFirst({
    where: {
      username: cleanUsername,
    },
    include: {
      links: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <a
            href="/"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
            title="Back to Home"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </a>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-blue-500 flex items-center justify-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
          <p className="text-gray-600 mb-4">@{user.username}</p>
          {user.bio && <p className="text-gray-700 mb-4 leading-relaxed max-w-md mx-auto">{user.bio}</p>}
          {user.links.length > 0 && (
            <p className="text-sm text-gray-500">
              {user.links.length} link{user.links.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Links Grid */}
        <div className="space-y-3">
          {user.links.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No links yet</p>
            </div>
          ) : (
            user.links.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all hover:scale-105 transform"
              >
                <p className="font-bold text-gray-900 text-lg">{link.title}</p>
                <p className="text-sm text-gray-500 truncate mt-1">{link.url}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
