import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Setores
  const setores = await Promise.all([
    prisma.setor.upsert({ where: { id: 1 }, update: {}, create: { nome: 'Produção' } }),
    prisma.setor.upsert({ where: { id: 2 }, update: {}, create: { nome: 'Administrativo' } }),
    prisma.setor.upsert({ where: { id: 3 }, update: {}, create: { nome: 'Manutenção' } }),
    prisma.setor.upsert({ where: { id: 4 }, update: {}, create: { nome: 'Logística' } }),
    prisma.setor.upsert({ where: { id: 5 }, update: {}, create: { nome: 'Qualidade' } }),
  ])

  // Faixas etárias
  await Promise.all([
    prisma.faixaEtaria.upsert({ where: { id: 1 }, update: {}, create: { label: 'Até 25 anos', ordem: 1 } }),
    prisma.faixaEtaria.upsert({ where: { id: 2 }, update: {}, create: { label: '26 a 35 anos', ordem: 2 } }),
    prisma.faixaEtaria.upsert({ where: { id: 3 }, update: {}, create: { label: '36 a 45 anos', ordem: 3 } }),
    prisma.faixaEtaria.upsert({ where: { id: 4 }, update: {}, create: { label: '46 anos ou mais', ordem: 4 } }),
  ])

  // Perguntas de exemplo (múltipla escolha)
  const p1 = await prisma.pergunta.upsert({
    where: { id: 1 },
    update: {},
    create: {
      texto: 'Você utiliza os EPIs adequados para sua função?',
      tipo: 'multipla_escolha',
      ordem: 1,
      opcoes: {
        create: [
          { texto: 'Sempre', ordem: 1 },
          { texto: 'Quase sempre', ordem: 2 },
          { texto: 'Às vezes', ordem: 3 },
          { texto: 'Raramente', ordem: 4 },
          { texto: 'Nunca', ordem: 5 },
        ],
      },
    },
  })

  const p2 = await prisma.pergunta.upsert({
    where: { id: 2 },
    update: {},
    create: {
      texto: 'Você conhece os procedimentos de emergência do seu setor?',
      tipo: 'multipla_escolha',
      ordem: 2,
      opcoes: {
        create: [
          { texto: 'Sim, totalmente', ordem: 1 },
          { texto: 'Parcialmente', ordem: 2 },
          { texto: 'Não conheço', ordem: 3 },
        ],
      },
    },
  })

  const p3 = await prisma.pergunta.upsert({
    where: { id: 3 },
    update: {},
    create: {
      texto: 'Você já presenciou ou sofreu algum incidente de segurança nos últimos 6 meses?',
      tipo: 'multipla_escolha',
      ordem: 3,
      opcoes: {
        create: [
          { texto: 'Sim, presenciei', ordem: 1 },
          { texto: 'Sim, sofri', ordem: 2 },
          { texto: 'Não', ordem: 3 },
        ],
      },
    },
  })

  const p4 = await prisma.pergunta.upsert({
    where: { id: 4 },
    update: {},
    create: {
      texto: 'Como você avalia as condições de segurança do seu ambiente de trabalho?',
      tipo: 'multipla_escolha',
      ordem: 4,
      opcoes: {
        create: [
          { texto: 'Excelente', ordem: 1 },
          { texto: 'Boa', ordem: 2 },
          { texto: 'Regular', ordem: 3 },
          { texto: 'Ruim', ordem: 4 },
          { texto: 'Péssima', ordem: 5 },
        ],
      },
    },
  })

  // Pergunta exclusiva de Produção + Manutenção
  const p5 = await prisma.pergunta.upsert({
    where: { id: 5 },
    update: {},
    create: {
      texto: 'As máquinas e equipamentos que você opera estão em bom estado de conservação?',
      tipo: 'multipla_escolha',
      ordem: 5,
      opcoes: {
        create: [
          { texto: 'Sim', ordem: 1 },
          { texto: 'Parcialmente', ordem: 2 },
          { texto: 'Não', ordem: 3 },
        ],
      },
    },
  })

  // Pergunta de texto aberto (para todos)
  const p6 = await prisma.pergunta.upsert({
    where: { id: 6 },
    update: {},
    create: {
      texto: 'Você tem alguma sugestão para melhorar a segurança no seu setor?',
      tipo: 'texto',
      ordem: 6,
    },
  })

  // Associar perguntas aos setores
  // P1, P2, P3, P4, P6 → todos os setores
  const perguntasGerais = [p1.id, p2.id, p3.id, p4.id, p6.id]
  for (const setor of setores) {
    for (const perguntaId of perguntasGerais) {
      await prisma.perguntaSetor.upsert({
        where: { perguntaId_setorId: { perguntaId, setorId: setor.id } },
        update: {},
        create: { perguntaId, setorId: setor.id },
      })
    }
  }

  // P5 → apenas Produção (1) e Manutenção (3)
  for (const setorId of [1, 3]) {
    await prisma.perguntaSetor.upsert({
      where: { perguntaId_setorId: { perguntaId: p5.id, setorId } },
      update: {},
      create: { perguntaId: p5.id, setorId },
    })
  }

  // Usuário admin
  const senhaHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12)
  await prisma.usuario.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@empresa.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@empresa.com',
      nome: 'Administrador',
      senha: senhaHash,
    },
  })

  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
