import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-600' },
    emerald:{ bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600' },
    amber:  { bg: 'bg-amber-50',   icon: 'bg-amber-100  text-amber-600'  },
    rose:   { bg: 'bg-rose-50',    icon: 'bg-rose-100   text-rose-600'   },
    violet: { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600' },
  }
  const c = colors[color] || colors.indigo

  const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-slate-400'
  const TrendIcon  = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
              <TrendIcon size={12} />
              <span>{Math.abs(trend)}% จากเดือนที่แล้ว</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${c.icon} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}
