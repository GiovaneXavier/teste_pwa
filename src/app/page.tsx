'use client'

import { useState, useEffect } from 'react'
import { Setor, FaixaEtaria, Pergunta } from '@/types'
import SeletorInicial from '@/components/form/SeletorInicial'
import FormularioSalus from '@/components/form/FormularioSalus'

type Etapa = 'selecao' | 'formulario' | 'confirmacao'

export default function Home() {
  const [etapa, setEtapa] = useState<Etapa>('selecao')
  const [setores, setSetores] = useState<Setor[]>([])
  const [faixas, setFaixas] = useState<FaixaEtaria[]>([])
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [setorId, setSetorId] = useState<number | null>(null)
  const [faixaEtariaId, setFaixaEtariaId] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(false)

  // Carregar setores e faixas na montagem
  useEffect(() => {
    Promise.all([
      fetch('/api/setores').then((r) => r.json()),
      fetch('/api/faixas-etarias').then((r) => r.json()),
    ]).then(([s, f]) => {
      setSetores(s)
      setFaixas(f)
    })
  }, [])

  // Ao clicar em "Iniciar pesquisa"
  async function handleIniciar() {
    if (!setorId) return
    setCarregando(true)
    try {
      const data = await fetch(`/api/perguntas?setorId=${setorId}`).then((r) => r.json())
      setPerguntas(data)
      setEtapa('formulario')
    } finally {
      setCarregando(false)
    }
  }

  // Após envio com sucesso → confirmação → reset após 3s
  function handleEnviado() {
    setEtapa('confirmacao')
    setTimeout(() => {
      setEtapa('selecao')
      setSetorId(null)
      setFaixaEtariaId(null)
      setPerguntas([])
    }, 3000)
  }

  function handleVoltar() {
    setEtapa('selecao')
    setPerguntas([])
  }

  if (etapa === 'confirmacao') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-salus-50 to-white p-6">
        <div className="text-center space-y-4 animate-pulse">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-salus-600 rounded-full mb-2 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-salus-800">Obrigado!</h2>
          <p className="text-gray-600">Sua resposta foi enviada com sucesso.</p>
          <p className="text-sm text-gray-400">Reiniciando em instantes...</p>
        </div>
      </div>
    )
  }

  if (etapa === 'formulario' && setorId && faixaEtariaId) {
    const nomeSetor = setores.find((s) => s.id === setorId)?.nome ?? ''
    return (
      <FormularioSalus
        perguntas={perguntas}
        setorId={setorId}
        faixaEtariaId={faixaEtariaId}
        nomeSetor={nomeSetor}
        onEnviado={handleEnviado}
        onVoltar={handleVoltar}
      />
    )
  }

  return (
    <>
      {carregando && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-salus-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <SeletorInicial
        setores={setores}
        faixas={faixas}
        setorId={setorId}
        faixaEtariaId={faixaEtariaId}
        onSetorChange={setSetorId}
        onFaixaChange={setFaixaEtariaId}
        onIniciar={handleIniciar}
      />
    </>
  )
}
