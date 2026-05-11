import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../features/auth/hooks/useAuth.js'

const titles = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload video',
  '/videos': 'Videos',
  '/jobs': 'Analysis jobs',
  '/health': 'API health',
  '/reports': 'Reports',
  '/consent': 'Consent & ethics',
  '/users': 'Users',
}

function titleForPath(pathname) {
  if (pathname.startsWith('/analysis/')) return 'Analysis result'
  return titles[pathname] || 'Dashboard'
}

function initialsFromUser(user) {
  if (user?.full_name) {
    const parts = user.full_name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (user?.email) return user.email.slice(0, 2).toUpperCase()
  return '—'
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const pageTitle = titleForPath(pathname)
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    function handlePointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </Button>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-900">
            {pageTitle}
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">
            Audio–visual analysis workspace
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex max-w-[14rem] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <span className="hidden max-w-[10rem] truncate text-sm text-slate-700 sm:inline">
                {user.full_name || user.email}
              </span>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-800 ring-2 ring-white"
                aria-hidden
              >
                {initialsFromUser(user)}
              </span>
            </button>
            {menuOpen ? (
              <div
                className="absolute right-0 z-50 mt-1 min-w-[10rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline"
            >
              Sign in
            </Link>
            <Link to="/register">
              <Button type="button" size="sm" variant="secondary">
                Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
