import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, description, category, tags, isFavorite } = body

    const prompt = await prisma.prompt.update({
      where: { id: params.id },
      data: {
        title,
        content,
        description,
        category,
        isFavorite,
        tags: {
          set: [],
          connectOrCreate: tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          })) || []
        }
      },
      include: {
        tags: true
      }
    })

    return NextResponse.json(prompt)
  } catch (error) {
    console.error('PUT prompt error:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.prompt.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE prompt error:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
