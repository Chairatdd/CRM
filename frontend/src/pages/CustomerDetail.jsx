import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Star, ShoppingBag, MessageSquare, User } from 'lucide-react'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import { getCustomer, getCustomerOrders, getCustomerInteractions } from '../api'

const fmt    = (n) => new Intl.NumberFormat('th-TH').format(Math.round(n))
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' }) : '-'
const fmtDateTime = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-'

const RFMStars = ({ score }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ))}
  </span>
)

const typeIcon = { Call:'📞', Email:'✉️', Visit:'🏢', Chat:'💬', Social:'📱' }
const outcomeRing = { Positive: 'ring-emerald-400', Neutral: 'ring-slate-300', Negative: 'ring-rose-400' }

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer]         = useState(null)
  const [orders, setOrders]             = useState([])
  const [interactions, setInteractions] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getCustomer(id),
      getCustomerOrders(id),
      getCustomerInteractions(id),
    ]).then(([c, o, i]) => {
      setCustomer(c.data)
      setOrders(o.data)
      setInteractions(i.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลลูกค้า..." />
  if (!customer) return <div className="p-6 text-slate-500">ไม่พบข้อมูลลูกค้า</div>

  const segments = customer.segments ? customer.segments.split(',') : []
  const segColors = customer.segment_colors ? customer.segment_colors.split(',') : []

  return (
    <div className="p-6 space-y-5">
      {/* Back */}
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={16} /> กลับ
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg"
            style={{ background: customer.avatar_color }}>
            {customer.first_name?.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{customer.first_name} {customer.last_name}</h1>
              <Badge label={customer.status} />
              <Badge label={customer.customer_type} />
            </div>
            <p className="text-slate-400 text-sm mb-3">{customer.customer_code}</p>

            {/* Segments */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {segments.map((seg, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full font-semibold border"
                  style={{ background: segColors[i] + '20', color: segColors[i], borderColor: segColors[i] + '50' }}>
                  {seg}
                </span>
              ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Lifetime Value', value: `฿${fmt(customer.lifetime_value)}`, color: 'text-indigo-600' },
                { label: 'ยอดสั่งซื้อรวม', value: `฿${fmt(customer.stats?.total_spent || 0)}`, color: 'text-emerald-600' },
                { label: 'Orders', value: customer.stats?.total_orders || 0, color: 'text-blue-600' },
                { label: 'Interactions', value: customer.stats?.total_interactions || 0, color: 'text-amber-600' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-400 mb-1">RFM Score</p>
            <RFMStars score={customer.rfm_score} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { key: 'interactions', label: `Interactions (${interactions.length})`, icon: MessageSquare },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">ข้อมูลติดต่อ</h3>
            <div className="space-y-3">
              {[
                { icon: Mail,   label: 'อีเมล', value: customer.email },
                { icon: Phone,  label: 'โทรศัพท์', value: customer.phone },
                { icon: MapPin, label: 'ที่อยู่', value: [customer.address, customer.city, customer.province, customer.postal_code].filter(Boolean).join(' ') },
              ].map(({ icon: Icon, label, value }) => value && (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">ข้อมูลทั่วไป</h3>
            <div className="space-y-3 text-sm">
              {[
                ['เพศ',        customer.gender === 'M' ? 'ชาย' : customer.gender === 'F' ? 'หญิง' : 'อื่น ๆ'],
                ['วันเกิด',    fmtDate(customer.date_of_birth)],
                ['ประเภทลูกค้า', customer.customer_type],
                ['สมัครเมื่อ', fmtDate(customer.created_at)],
                ['ซื้อล่าสุด', fmtDate(customer.stats?.last_order_date)],
                ['ติดต่อล่าสุด', fmtDateTime(customer.stats?.last_interaction_date)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-medium text-slate-700">{v || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {tab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">เลขที่</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">รายการ</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ยอด</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">วันที่</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-indigo-600">{o.order_number}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{o.items_summary}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">฿{fmt(o.total_amount)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(o.order_date)}</td>
                  <td className="px-4 py-3"><Badge label={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-12 text-slate-400 text-sm">ยังไม่มีประวัติสั่งซื้อ</p>}
        </div>
      )}

      {/* Tab: Interactions */}
      {tab === 'interactions' && (
        <div className="space-y-3">
          {interactions.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex gap-4">
              <div className={`w-10 h-10 rounded-full ring-2 ${outcomeRing[item.outcome] || 'ring-slate-300'} bg-slate-100 flex items-center justify-center text-lg flex-shrink-0`}>
                {typeIcon[item.type] || '💬'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-sm">{item.subject}</span>
                  <Badge label={item.type} />
                  <Badge label={item.outcome} />
                </div>
                <p className="text-xs text-slate-500 mb-2">{item.notes}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>👤 {item.agent_name}</span>
                  <span>🕐 {fmtDateTime(item.interaction_date)}</span>
                </div>
              </div>
            </div>
          ))}
          {interactions.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center text-slate-400 text-sm border border-slate-100">
              ยังไม่มีประวัติ interaction
            </div>
          )}
        </div>
      )}
    </div>
  )
}
