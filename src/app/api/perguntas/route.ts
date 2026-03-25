import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/perguntas?setorId=1 — buscar perguntas do setor (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const setorId = searchParams.get('setorId')

    if (!setorId) {
      return NextResponse.json({ erro: 'setorId obrigatório' }, { status: 400 })
    }

    const perguntas = await prisma.pergunta.findMany({
      where: {
        ativo: true,
        setores: {
          some: { setorId: Number(setorId) },
        },
      },
      include: {
        opcoes: {
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { ordem: 'asc' },
    })

    return NextResponse.json(perguntas)
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
