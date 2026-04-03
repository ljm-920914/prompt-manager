import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const favorite = searchParams.get('favorite')

  const where: any = {}

  if (category && category !== 'all') {
    where.category = category
  }

  if (tag) {
    where.tags = {
      some: {
        name: tag
      }
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (favorite === 'true') {
    where.isFavorite = true
  }

  const prompts = await prisma.prompt.findMany({
    where,
    include: {
      tags: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return NextResponse.json(prompts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, content, description, source, sourceType, tags, category } = body

  const prompt = await prisma.prompt.create({
    data: {
      title,
      content,
      description,
      source,
      sourceType,
      category: category || '未分类',
      tags: {
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
}
