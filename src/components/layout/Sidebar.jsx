import { NavLink } from 'react-router-dom'
import { mainNav } from './mainNav.js'
import { NavIcon } from './navConfig.jsx'

export default function Sidebar({ onNavigate }) {
  const linkClass = ({ isActive }) =>
    [
      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ')

  return (
    <aside className="flex h-full flex-col border-r border-slate-200/80 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
          H
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">HAYEE</p>
          <p className="text-xs text-slate-500">AV Analytics</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            onClick={() => onNavigate?.()}
          >
            <span className="text-slate-400 group-[.active]:text-indigo-600">
              <NavIcon name={item.icon} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200/80 p-3">
        <NavLink
          to="/login"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          onClick={() => onNavigate?.()}
        >
          Sign out
        </NavLink>
      </div>
    </aside>
  )
}
