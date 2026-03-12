import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { title, url } = await req.json()

    if (!title || !url) {
      return NextResponse.json(
        { message: "Title and URL are required" },
        { status: 400 }
      )
    }

    // Check if link belongs to user
    const link = await prisma.link.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!link) {
      return NextResponse.json(
        { message: "Link not found" },
        { status: 404 }
      )
    }

    if (link.user.email !== session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const updatedLink = await prisma.link.update({
      where: { id },
      data: { title, url },
    })

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error("Update link error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if link belongs to user
    const link = await prisma.link.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!link) {
      return NextResponse.json(
        { message: "Link not found" },
        { status: 404 }
      )
    }

    if (link.user.email !== session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    await prisma.link.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Link deleted successfully",
    })
  } catch (error) {
    console.error("Delete link error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
