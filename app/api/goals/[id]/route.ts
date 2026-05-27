import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: { subTasks: true },
    })
    if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(goal)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { title, description, status, progress, targetDate, targetValue, currentValue } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null
    if (targetValue !== undefined) updateData.targetValue = targetValue
    if (currentValue !== undefined) {
      updateData.currentValue = currentValue
      // Auto-calculate progress if target value set
      const goal = await prisma.goal.findUnique({ where: { id: params.id } })
      if (goal?.targetValue) {
        updateData.progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100))
      }
    }
    if (progress !== undefined) updateData.progress = Math.min(100, Math.max(0, progress))

    // Auto-complete when progress hits 100
    if (updateData.progress === 100 && !updateData.status) {
      updateData.status = 'COMPLETED'
      updateData.completedAt = new Date()
    }

    const updated = await prisma.goal.update({
      where: { id: params.id },
      data: updateData,
      include: { subTasks: true },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subTask.deleteMany({ where: { goalId: params.id } })
    await prisma.goal.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
