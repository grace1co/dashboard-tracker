import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { title } = body
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const subtask = await prisma.subTask.create({
      data: { title, goalId: params.id },
    })
    return NextResponse.json(subtask, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
