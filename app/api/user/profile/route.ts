import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) return Response.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        likes: true,
      }
    });

    if (!user) return Response.json({ message: "User not found" }, { status: 404 });
    return Response.json(user);
  } catch (error: any) {
    console.error("DEBUG NEON ERROR:", error); // ดู Error เต็มๆ ใน Terminal
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, username, bio } = await req.json()

    if (!name || !username) {
      return NextResponse.json(
        { message: "Name and username are required" },
        { status: 400 }
      )
    }

    // Ensure username is lowercase and alphanumeric
    const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, "")

    if (!cleanUsername) {
      return NextResponse.json(
        { message: "Invalid username" },
        { status: 400 }
      )
    }

    // Check if username is already taken (case-insensitive)
    if (cleanUsername) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { username: cleanUsername },
            { email: { not: session.user.email } },
          ],
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { message: "Username already taken" },
          { status: 409 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        username: cleanUsername,
        bio: bio || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        bio: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
