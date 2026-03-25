import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/setores — listar setores ativos (público)
export async function GET() {
  try {
    const setores = await prisma.setor.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    })
    return NextResponse.json(setores)
  } catch (error) {
    console.error('Erro ao buscar setores:', error)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
