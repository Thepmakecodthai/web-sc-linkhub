import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        links: true,
        _count: {
          select: { likesReceived: true }
        }
      },
    })

    // Transform data to match HomeClient interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      bio: user.bio,
      links: user.links,
      likes: user._count.likesReceived,
      createdAt: user.createdAt.toISOString(),
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}