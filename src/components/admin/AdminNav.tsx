'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Props {
  userName: string
}

export default function AdminNav({ userName }: Props) {
  const pathname = usePathname()

  return (
    <nav className="bg-salus-700 text-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="font-bold text-lg">Salus</span>
          </div>
          <div className="flex gap-1">
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/admin' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/respostas"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/admin/respostas' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Respostas
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-salus-100 hidden sm:block">{userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
