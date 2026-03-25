'use client'

import { Pergunta, ItemResposta } from '@/types'

interface Props {
  pergunta: Pergunta
  resposta?: ItemResposta
  onChange: (item: ItemResposta) => void
  numero: number
}

export default function PerguntaTexto({ pergunta, resposta, onChange, numero }: Props) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-salus-700 mb-1">Pergunta {numero}</p>
      <p className="text-base font-semibold text-gray-900 mb-4">{pergunta.texto}</p>
      <textarea
        value={resposta?.valorTexto ?? ''}
        onChange={(e) =>
          onChange({ perguntaId: pergunta.id, valorTexto: e.target.value })
        }
        placeholder="Digite sua resposta aqui..."
        rows={4}
        className="input resize-none"
      />
    </div>
  )
}
