import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Users, TrendingUp, MessageSquare, UserPlus, Star
} from 'lucide-react'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  getDashboardStats, getRevenueTrend,
  getSegmentDistribution, getRecentInteractions, getTopCustomers
} from '../api'

const fmt = (n) => new Intl.NumberFormat('th-TH').format(Math.round(n))
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-'
const MONTH_TH = { '01':'ม.ค.','02':'ก.พ.','03':'มี.ค.','04':'เม.ย.','05':'พ.ค.','06':'มิ.ย.','07':'ก.ค.','08':'ส.ค.','09':'ก.ย.','10':'ต.ค.','11':'พ.ย.','12':'ธ.ค.' }

const RFMStars = ({ score }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={11} className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ))}
  </span>
)

export default function Dashboard() {
  const [stats, setStats]           = useState(null)
  const [revenue, setRevenue]       = useState([])
  const [segments, setSegments]     = useState([])
  const [interactions, setInteractions] = useState([])
  const [topCustomers, setTop]      = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRevenueTrend(),
      getSegmentDistribution(),
      getRecentInteractions(),
      getTopCustomers(),
    ]).then(([s, r, sg, i, tc]) => {
      setStats(s.data)
      setRevenue(r.data.map(row => ({
        ...row,
        monthLabel: MONTH_TH[row.month?.split('-')[1]] || row.month,
        revenue: Number(row.revenue)
      })))
      setSegments(sg.data)
      setInteractions(i.data)
      setTop(tc.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="กำลังโหลด Dashboard..." />

  const revGrowth = stats?.revenue_last_month > 0
    ? Math.round(((stats.revenue_month - stats.revenue_last_month) / stats.revenue_last_month) * 100)
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">ภาพรวมระบบ CRM / CDP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="ลูกค้าทั้งหมด" icon={Users} color="indigo"
          value={fmt(stats?.total_customers || 0)}
          subtitle={`Active ${fmt(stats?.active_customers || 0)} ราย`}
        />
        <StatCard
          title="รายได้เดือนนี้" icon={TrendingUp} color="emerald"
          value={`฿${fmt(stats?.revenue_month || 0)}`}
          trend={revGrowth}
        />
        <StatCard
          title="Interactions เดือนนี้" icon={MessageSquare} color="amber"
          value={fmt(stats?.interactions_month || 0)}
          subtitle="ทุก channel"
        />
        <StatCard
          title="ลูกค้าใหม่เดือนนี้" icon={UserPlus} color="violet"
          value={fmt(stats?.new_customers_month || 0)}
          subtitle="ลูกค้าใหม่ 30 วัน"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">รายได้ 6 เดือนล่าสุด</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                formatter={v => [`฿${fmt(v)}`, 'รายได้']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2}
                fill="url(#revGrad)" dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Segment distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Customer Segments</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={segments} dataKey="count" nameKey="name" cx="50%" cy="50%"
                innerRadius={45} outerRadius={70} paddingAngle={3}>
                {segments.map((seg, i) => (
                  <Cell key={i} fill={seg.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12, borderRadius: 8, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.12)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <span className="text-slate-600">{seg.name}</span>
                </div>
                <span className="font-semibold text-slate-700">{seg.count} ราย</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent interactions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Interactions ล่าสุด</h2>
            <Link to="/interactions" className="text-indigo-600 text-xs font-medium hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {interactions.map(item => (
              <div key={item.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: item.avatar_color }}>
                  {item.customer_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{item.customer_name}</span>
                    <Badge label={item.type} />
                    <Badge label={item.outcome} />
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.subject}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{fmtDate(item.interaction_date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top customers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Top 5 ลูกค้า (LTV)</h2>
            <Link to="/customers" className="text-indigo-600 text-xs font-medium hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {topCustomers.map((c, idx) => (
              <Link key={c.id} to={`/customers/${c.id}`}
                className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <span className="w-6 text-xs font-bold text-slate-400">#{idx + 1}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: c.avatar_color }}>
                  {c.first_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{c.first_name} {c.last_name}</p>
                  <RFMStars score={c.rfm_score} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">฿{fmt(c.lifetime_value)}</p>
                  <p className="text-xs text-slate-400">LTV</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
