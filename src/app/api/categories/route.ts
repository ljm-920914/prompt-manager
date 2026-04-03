import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const prompts = await prisma.prompt.findMany({
    select: {
      category: true
    },
    distinct: ['category']
  })

  const categories = prompts.map(p => p.category)
  return NextResponse.json(categories)
}
