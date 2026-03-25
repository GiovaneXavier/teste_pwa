import ExcelJS from 'exceljs'
import { prisma } from './prisma'

interface FiltrosExport {
  setorId?: number
  faixaEtariaId?: number
  de?: string
  ate?: string
}

export async function gerarExcel(filtros: FiltrosExport): Promise<Buffer> {
  // Buscar todas as perguntas ativas ordenadas
  const perguntas = await prisma.pergunta.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
  })

  // Buscar respostas com filtros
  const where: Record<string, unknown> = {}
  if (filtros.setorId) where.setorId = filtros.setorId
  if (filtros.faixaEtariaId) where.faixaEtariaId = filtros.faixaEtariaId
  if (filtros.de || filtros.ate) {
    where.criadoEm = {
      ...(filtros.de ? { gte: new Date(filtros.de) } : {}),
      ...(filtros.ate ? { lte: new Date(filtros.ate + 'T23:59:59') } : {}),
    }
  }

  const respostas = await prisma.resposta.findMany({
    where,
    include: {
      setor: true,
      faixaEtaria: true,
      itens: {
        include: {
          pergunta: true,
          opcao: true,
        },
      },
    },
    orderBy: { criadoEm: 'desc' },
  })

  // Criar workbook
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Salus EHS'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Respostas', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  // Definir colunas
  sheet.columns = [
    { header: 'Data/Hora', key: 'criadoEm', width: 20 },
    { header: 'Setor', key: 'setor', width: 20 },
    { header: 'Faixa Etária', key: 'faixaEtaria', width: 18 },
    ...perguntas.map((p) => ({
      header: p.texto,
      key: `p_${p.id}`,
      width: 30,
    })),
  ]

  // Estilizar cabeçalho
  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' },
    }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF15803D' } },
    }
  })
  headerRow.height = 40

  // Preencher dados
  respostas.forEach((resposta, idx) => {
    const row: Record<string, string> = {
      criadoEm: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(resposta.criadoEm),
      setor: resposta.setor.nome,
      faixaEtaria: resposta.faixaEtaria.label,
    }

    for (const item of resposta.itens) {
      const key = `p_${item.perguntaId}`
      row[key] = item.opcao ? item.opcao.texto : (item.valorTexto ?? '')
    }

    const dataRow = sheet.addRow(row)
    if (idx % 2 === 1) {
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0FDF4' },
        }
      })
    }
    dataRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true }
    })
  })

  // Retornar buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
