import { prisma } from '@/lib/prisma'

async function getDashboardData() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [total, hoje24h, porSetor] = await Promise.all([
    prisma.resposta.count(),
    prisma.resposta.count({ where: { criadoEm: { gte: hoje } } }),
    prisma.resposta.groupBy({
      by: ['setorId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])

  const setores = await prisma.setor.findMany({ where: { ativo: true } })
  const porSetorNome = porSetor.map((item) => ({
    nome: setores.find((s) => s.id === item.setorId)?.nome ?? 'N/A',
    total: item._count.id,
  }))

  return { total, hoje24h, porSetorNome }
}

export default async function AdminPage() {
  const { total, hoje24h, porSetorNome } = await getDashboardData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral das respostas do formulário Salus</p>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Total de respostas</p>
          <p className="text-4xl font-bold text-salus-700 mt-1">{total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Hoje</p>
          <p className="text-4xl font-bold text-salus-700 mt-1">{hoje24h}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Setores ativos</p>
          <p className="text-4xl font-bold text-salus-700 mt-1">{porSetorNome.length}</p>
        </div>
      </div>

      {/* Respostas por setor */}
      {porSetorNome.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Respostas por setor</h2>
          <div className="space-y-3">
            {porSetorNome.map((item) => {
              const pct = total > 0 ? Math.round((item.total / total) * 100) : 0
              return (
                <div key={item.nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.nome}</span>
                    <span className="text-gray-500">{item.total} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-salus-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p>Nenhuma resposta ainda</p>
        </div>
      )}
    </div>
  )
}
