import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// --- ฟังก์ชันสำหรับเพิ่มลิ้งก์ใหม่ ---
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, url } = await req.json()

    if (!title || !url) {
      return NextResponse.json({ message: "Title and URL are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // เช็กลิ้งก์ซ้ำ (ข้อ 3 ที่เราทำกัน)
    const existingLink = await prisma.link.findFirst({
      where: {
        userId: user.id,
        url: url.trim(),
      },
    })

    if (existingLink) {
      return NextResponse.json(
        { message: "ลิ้งก์นี้คุณเคยเพิ่มไปแล้วครับ" },
        { status: 400 }
      )
    }

    const link = await prisma.link.create({
      data: {
        title: title.trim(),
        url: url.trim(),
        userId: user.id,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error: any) {
    console.error("Create link error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// --- ฟังก์ชันสำหรับดึงลิ้งก์มาโชว์ (ตัวปัญหาที่ซ้ำ) ---
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const links = await prisma.link.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }, // เรียงตามเวลาล่าสุด
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error("Get links error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}