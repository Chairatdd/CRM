const presets = {
  Active:   'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-amber-100   text-amber-700',
  Churned:  'bg-rose-100    text-rose-700',
  Positive: 'bg-emerald-100 text-emerald-700',
  Neutral:  'bg-slate-100   text-slate-600',
  Negative: 'bg-rose-100    text-rose-700',
  Delivered:'bg-emerald-100 text-emerald-700',
  Shipped:  'bg-blue-100    text-blue-700',
  Confirmed:'bg-indigo-100  text-indigo-700',
  Pending:  'bg-amber-100   text-amber-700',
  Cancelled:'bg-rose-100    text-rose-700',
  Call:     'bg-blue-100    text-blue-700',
  Email:    'bg-violet-100  text-violet-700',
  Visit:    'bg-emerald-100 text-emerald-700',
  Chat:     'bg-cyan-100    text-cyan-700',
  Social:   'bg-pink-100    text-pink-700',
  Individual: 'bg-slate-100 text-slate-600',
  Corporate:  'bg-indigo-100 text-indigo-700',
}

export default function Badge({ label, className = '' }) {
  const cls = presets[label] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {label}
    </span>
  )
}
