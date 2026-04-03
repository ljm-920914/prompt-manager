import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    })

    const categories = prompts.map(p => p.category)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('GET categories error:', error)
    return NextResponse.json([])
  }
}
