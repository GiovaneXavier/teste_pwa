import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FiltrosRespostas from '@/components/admin/FiltrosRespostas'

interface SearchParams {
  setorId?: string
  faixaEtariaId?: string
  de?: string
  ate?: string
  pagina?: string
}

const POR_PAGINA = 20

export default async function RespostasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const pagina = parseInt(sp.pagina || '1')
  const where: Record<string, unknown> = {}

  if (sp.setorId) where.setorId = Number(sp.setorId)
  if (sp.faixaEtariaId) where.faixaEtariaId = Number(sp.faixaEtariaId)
  if (sp.de || sp.ate) {
    where.criadoEm = {
      ...(sp.de ? { gte: new Date(sp.de) } : {}),
      ...(sp.ate ? { lte: new Date(sp.ate + 'T23:59:59') } : {}),
    }
  }

  const [total, respostas, setores, faixas] = await Promise.all([
    prisma.resposta.count({ where }),
    prisma.resposta.findMany({
      where,
      include: {
        setor: { select: { nome: true } },
        faixaEtaria: { select: { label: true } },
      },
      orderBy: { criadoEm: 'desc' },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.setor.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
    prisma.faixaEtaria.findMany({ orderBy: { ordem: 'asc' } }),
  ])

  const totalPaginas = Math.ceil(total / POR_PAGINA)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Respostas</h1>
          <p className="text-gray-500 text-sm mt-1">{total} resposta{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <FiltrosRespostas setores={setores} faixas={faixas} />

      {respostas.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p>Nenhuma resposta encontrada com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-salus-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-salus-800">#</th>
                <th className="text-left px-4 py-3 font-semibold text-salus-800">Data/Hora</th>
                <th className="text-left px-4 py-3 font-semibold text-salus-800">Setor</th>
                <th className="text-left px-4 py-3 font-semibold text-salus-800">Faixa Etária</th>
                <th className="text-left px-4 py-3 font-semibold text-salus-800">Respostas</th>
              </tr>
            </thead>
            <tbody>
              {respostas.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-400 font-mono">{r.id}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Intl.DateTimeFormat('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }).format(r.criadoEm)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-salus-100 text-salus-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {r.setor.nome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.faixaEtaria.label}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/respostas/${r.id}`}
                      className="text-salus-600 hover:text-salus-800 font-medium"
                    >
                      Ver detalhe →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Página {pagina} de {totalPaginas}
              </p>
              <div className="flex gap-2">
                {pagina > 1 && (
                  <Link
                    href={`/admin/respostas?${new URLSearchParams({ ...sp, pagina: String(pagina - 1) })}`}
                    className="btn-secondary py-1.5 px-3 text-sm"
                  >
                    ← Anterior
                  </Link>
                )}
                {pagina < totalPaginas && (
                  <Link
                    href={`/admin/respostas?${new URLSearchParams({ ...sp, pagina: String(pagina + 1) })}`}
                    className="btn-primary py-1.5 px-3 text-sm"
                  >
                    Próxima →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
