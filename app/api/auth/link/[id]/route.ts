import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// แก้ไข Parameter ให้ params เป็น Promise
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  // ต้อง await params ก่อนเพื่อเอา id ออกมา
  const { id } = await params;

  await prisma.link.delete({
    where: { id: id },
  })

  return NextResponse.json({ success: true })
}