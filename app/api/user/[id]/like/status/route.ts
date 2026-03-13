import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/user/[id]/like - Check if current user has liked this profile

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json({ hasLiked: false }, { status: 200 })
    }

    const { id: targetUserId } = await params

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ hasLiked: false }, { status: 200 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId,
        },
      },
    })

    return NextResponse.json({ hasLiked: !!existingLike }, { status: 200 })
  } catch (error: any) {
    console.error("Check like status error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}