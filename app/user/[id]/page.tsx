import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import Link from "next/link"
import { HiArrowLeft } from "react-icons/hi2"
import LikeButton from "../../components/LikeButton"

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getAuthSession()
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { username: id },
        { id: id }
      ]
    },
    include: { 
      links: true,
      _count: {
        select: { likesReceived: true }
      }
    },
  })

  const likesCount = user?._count?.likesReceived || 0

  console.log('UserProfilePage:', { id, session: !!session, user: !!user })

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              LinkHub
            </Link>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">User not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            LinkHub
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition"
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Creators
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-6">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-5xl">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name || "Creator"}</h1>
                  {user.username && <p className="text-gray-600 text-lg mb-2">@{user.username}</p>}
                  <p className="text-gray-500 mb-4">{user.email}</p>
                  {user.bio && <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>}
                </div>
                <LikeButton
                  key={`like-${user.id}`}
                  targetUserId={user.id}
                  initialLikes={likesCount}
                  isLoggedIn={!!session}
                />
              </div>
              <div className="inline-block bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-blue-600 font-semibold text-lg">{user.links.length}</p>
                <p className="text-blue-500 text-sm">link{user.links.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        {user.links.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Links</h2>
            <div className="space-y-3">
              {user.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
                >
                  <p className="font-semibold text-blue-600 hover:text-blue-700">{link.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{link.url}</p>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">No links yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
