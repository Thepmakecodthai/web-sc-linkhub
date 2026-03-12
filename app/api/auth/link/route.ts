import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const link = await prisma.link.create({
    data: {
      title: body.title,
      url: body.url,
      order: 0,
      userId: body.userId,
    },
  })

  return NextResponse.json(link)
}
