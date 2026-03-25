import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { gerarExcel } from '@/lib/excel'

// GET /api/export — exportar respostas em Excel (requer auth)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const filtros = {
      setorId: searchParams.get('setorId') ? Number(searchParams.get('setorId')) : undefined,
      faixaEtariaId: searchParams.get('faixaEtariaId') ? Number(searchParams.get('faixaEtariaId')) : undefined,
      de: searchParams.get('de') ?? undefined,
      ate: searchParams.get('ate') ?? undefined,
    }

    const buffer = await gerarExcel(filtros)
    const dataHoje = new Date().toISOString().split('T')[0]

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="salus-respostas-${dataHoje}.xlsx"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    return NextResponse.json({ erro: 'Erro ao gerar arquivo' }, { status: 500 })
  }
}
