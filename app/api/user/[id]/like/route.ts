import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST /api/user/[id]/like - Like a user profile
// DELETE /api/user/[id]/like - Unlike a user profile

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id: targetUserId } = await params

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json({ message: "Target user not found" }, { status: 404 })
    }

    // Check if user is trying to like themselves
    if (currentUser.id === targetUserId) {
      return NextResponse.json({ message: "Cannot like your own profile" }, { status: 400 })
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

    if (existingLike) {
      return NextResponse.json({ message: "Already liked this profile" }, { status: 400 })
    }

    // Create the like
    await prisma.like.create({
      data: {
        likerId: currentUser.id,
        likedUserId: targetUserId,
      },
    })

    return NextResponse.json({ message: "Profile liked successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Like profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id: targetUserId } = await params

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if the like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId,
        },
      },
    })

    if (!existingLike) {
      return NextResponse.json({ message: "Like not found" }, { status: 404 })
    }

    // Delete the like
    await prisma.like.delete({
      where: {
        likerId_likedUserId: {
          likerId: currentUser.id,
          likedUserId: targetUserId,
        },
      },
    })

    return NextResponse.json({ message: "Profile unliked successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Unlike profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}