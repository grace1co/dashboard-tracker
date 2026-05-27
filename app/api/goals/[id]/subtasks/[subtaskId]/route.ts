import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const body = await req.json()
    const { completed, title } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completedAt = completed ? new Date() : null
    }

    const updated = await prisma.subTask.update({
      where: { id: params.subtaskId },
      data: updateData,
    })

    // Recalculate parent goal progress based on subtask completion
    const allSubtasks = await prisma.subTask.findMany({
      where: { goalId: params.id },
    })
    if (allSubtasks.length > 0) {
      const completedCount = allSubtasks.filter((s) => s.completed).length
      const newProgress = Math.round((completedCount / allSubtasks.length) * 100)
      await prisma.goal.update({
        where: { id: params.id },
        data: {
          progress: newProgress,
          ...(newProgress === 100 ? { status: 'COMPLETED', completedAt: new Date() } : {}),
        },
      })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    await prisma.subTask.delete({ where: { id: params.subtaskId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
