import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function DetalheRespostaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resposta = await prisma.resposta.findUnique({
    where: { id: Number(id) },
    include: {
      setor: true,
      faixaEtaria: true,
      itens: {
        include: {
          pergunta: true,
          opcao: true,
        },
        orderBy: { pergunta: { ordem: 'asc' } },
      },
    },
  })

  if (!resposta) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/respostas" className="text-salus-600 hover:text-salus-800 text-sm font-medium">
          ← Voltar
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 text-sm">Resposta #{resposta.id}</span>
      </div>

      <div className="card space-y-2">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-salus-100 text-salus-800 px-3 py-1 rounded-full font-medium">
            {resposta.setor.nome}
          </span>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {resposta.faixaEtaria.label}
          </span>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
            {new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            }).format(resposta.criadoEm)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {resposta.itens.map((item, idx) => (
          <div key={item.id} className="card">
            <p className="text-xs font-medium text-salus-600 mb-1">Pergunta {idx + 1}</p>
            <p className="font-semibold text-gray-800 mb-2">{item.pergunta.texto}</p>
            <p className="text-gray-700 bg-salus-50 rounded-lg px-3 py-2">
              {item.opcao ? item.opcao.texto : (item.valorTexto || '—')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
