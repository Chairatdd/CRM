import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Tag, MessageSquare,
  ShoppingCart, UserCog, ChevronRight
} from 'lucide-react'

const nav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers',    icon: Users,           label: 'ลูกค้า' },
  { to: '/segments',     icon: Tag,             label: 'Segments' },
  { to: '/interactions', icon: MessageSquare,   label: 'Interactions' },
  { to: '/users',        icon: UserCog,         label: 'ทีม CRM' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">CRM System</p>
            <p className="text-slate-400 text-xs mt-0.5">Customer Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
          เมนูหลัก
        </p>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">ผู้ดูแลระบบ</p>
            <p className="text-slate-500 text-xs truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
