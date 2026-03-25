import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/faixas-etarias — listar faixas etárias (público)
export async function GET() {
  try {
    const faixas = await prisma.faixaEtaria.findMany({
      orderBy: { ordem: 'asc' },
    })
    return NextResponse.json(faixas)
  } catch (error) {
    console.error('Erro ao buscar faixas etárias:', error)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
