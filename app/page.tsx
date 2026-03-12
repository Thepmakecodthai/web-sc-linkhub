import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import Link from "next/link"
import UserMenu from "@/app/components/UserMenu"
import HomeClient from "@/app/components/HomeClient"

export default async function Home() {
  const session = await getAuthSession()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      links: true,
    },
  })

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent whitespace-nowrap">
                LinkHub
              </Link>
            </div>

            {/* Menu */}
            <div className="flex items-center gap-3 ml-auto">
              {session ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Dashboard
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">CS LinkHub</h1>
          <p className="text-xl text-gray-600 mb-2">Connect, Share & Discover Amazing Links</p>
          <p className="text-gray-500 max-w-2xl">A community platform for creators to showcase their curated link collections. Find your favorite creators and explore their recommended resources.</p>
        </div>

        {/* Search and Users */}
        <HomeClient users={users as any} session={session} />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <h3 className="text-xl font-bold text-white">CS LinkHub</h3>
              </div>
              <p className="text-sm text-gray-400">A community platform for sharing and discovering curated link collections.</p>
            </div>

            {/* Links */} 
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                {!session && (
                  <>
                    <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                    <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
                  </>
                )}
                {session && (
                  <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                )}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <p className="text-sm text-gray-400">CS LinkHub is a platform for creators to share their favorite links and build their communities.</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-gray-400">© 2026 CS LinkHub. All rights reserved.</p>
              <p className="text-sm text-gray-400">Made with ❤️ for the community</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
