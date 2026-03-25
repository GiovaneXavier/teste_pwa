export interface Setor {
  id: number
  nome: string
}

export interface FaixaEtaria {
  id: number
  label: string
  ordem: number
}

export interface OpcaoResposta {
  id: number
  texto: string
  ordem: number
}

export interface Pergunta {
  id: number
  texto: string
  tipo: 'multipla_escolha' | 'texto'
  ordem: number
  opcoes: OpcaoResposta[]
}

export interface ItemResposta {
  perguntaId: number
  opcaoId?: number
  valorTexto?: string
}
