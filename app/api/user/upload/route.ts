import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File must be an image" }, { status: 400 })
    }

    // ตรวจสอบขนาดไฟล์ (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File size must be less than 5MB" }, { status: 400 })
    }

    // --- อัปโหลดไปยัง Vercel Blob ---
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
    });

    // อัปเดต URL รูปภาพในฐานข้อมูล Neon
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: blob.url,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 })
  }
}