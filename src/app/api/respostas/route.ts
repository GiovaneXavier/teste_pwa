import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/respostas — salvar nova resposta (público, sem auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { setorId, faixaEtariaId, itens } = body

    if (!setorId || !faixaEtariaId || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })
    }

    const resposta = await prisma.resposta.create({
      data: {
        setorId: Number(setorId),
        faixaEtariaId: Number(faixaEtariaId),
        itens: {
          create: itens.map((item: { perguntaId: number; opcaoId?: number; valorTexto?: string }) => ({
            perguntaId: Number(item.perguntaId),
            opcaoId: item.opcaoId ? Number(item.opcaoId) : null,
            valorTexto: item.valorTexto ?? null,
          })),
        },
      },
    })

    return NextResponse.json({ id: resposta.id }, { status: 201 })
  } catch (error) {
    console.error('Erro ao salvar resposta:', error)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET /api/respostas — listar respostas (requer auth)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const setorId = searchParams.get('setorId')
    const faixaEtariaId = searchParams.get('faixaEtariaId')
    const de = searchParams.get('de')
    const ate = searchParams.get('ate')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const porPagina = 20

    const where: Record<string, unknown> = {}
    if (setorId) where.setorId = Number(setorId)
    if (faixaEtariaId) where.faixaEtariaId = Number(faixaEtariaId)
    if (de || ate) {
      where.criadoEm = {
        ...(de ? { gte: new Date(de) } : {}),
        ...(ate ? { lte: new Date(ate + 'T23:59:59') } : {}),
      }
    }

    const [total, respostas] = await Promise.all([
      prisma.resposta.count({ where }),
      prisma.resposta.findMany({
        where,
        include: {
          setor: { select: { nome: true } },
          faixaEtaria: { select: { label: true } },
          itens: {
            include: {
              pergunta: { select: { texto: true, tipo: true } },
              opcao: { select: { texto: true } },
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
    ])

    return NextResponse.json({
      respostas,
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina),
    })
  } catch (error) {
    console.error('Erro ao listar respostas:', error)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
