import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag, Users, Star, ChevronRight } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import Badge from '../components/Badge'
import { getSegments, getSegmentCustomers } from '../api'

const fmt = (n) => new Intl.NumberFormat('th-TH').format(Math.round(n))

const RFMStars = ({ score }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={10} className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ))}
  </span>
)

export default function Segments() {
  const [segments,  setSegments]  = useState([])
  const [selected,  setSelected]  = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [custLoading, setCustLoading] = useState(false)

  useEffect(() => {
    getSegments().then(r => {
      setSegments(r.data)
      if (r.data.length) selectSegment(r.data[0])
    }).finally(() => setLoading(false))
  }, [])

  const selectSegment = async (seg) => {
    setSelected(seg)
    setCustLoading(true)
    const res = await getSegmentCustomers(seg.id)
    setCustomers(res.data)
    setCustLoading(false)
  }

  if (loading) return <LoadingSpinner text="กำลังโหลด Segments..." />

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Customer Segments</h1>
        <p className="text-slate-500 text-sm mt-1">จัดกลุ่มลูกค้าตาม Segment</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Segment list */}
        <div className="space-y-2">
          {segments.map(seg => (
            <button key={seg.id} onClick={() => selectSegment(seg)}
              className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
                selected?.id === seg.id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-100'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: seg.color + '22' }}>
                  <Tag size={18} style={{ color: seg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{seg.name}</p>
                  <p className="text-slate-500 text-xs truncate">{seg.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg" style={{ color: seg.color }}>{seg.customer_count}</p>
                  <p className="text-xs text-slate-400">ราย</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Customers in selected segment */}
        <div className="xl:col-span-2">
          {selected && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: selected.color + '22' }}>
                  <Tag size={16} style={{ color: selected.color }} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 text-sm">{selected.name}</h2>
                  <p className="text-slate-400 text-xs">{customers.length} ลูกค้า</p>
                </div>
              </div>

              {custLoading ? <LoadingSpinner /> : (
                <div className="divide-y divide-slate-50">
                  {customers.map(c => (
                    <Link key={c.id} to={`/customers/${c.id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: c.avatar_color }}>
                        {c.first_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800">{c.first_name} {c.last_name}</p>
                          <Badge label={c.status} />
                        </div>
                        <p className="text-xs text-slate-400">{c.city}, {c.province}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">฿{fmt(c.lifetime_value)}</p>
                        <RFMStars score={c.rfm_score} />
                      </div>
                      <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                    </Link>
                  ))}
                  {customers.length === 0 && (
                    <p className="text-center py-10 text-slate-400 text-sm">ไม่มีลูกค้าใน segment นี้</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
