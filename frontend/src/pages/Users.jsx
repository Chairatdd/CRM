import { useEffect, useState } from 'react'
import { Shield, UserCog, Users as UsersIcon } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import Badge from '../components/Badge'
import { getUsers, login } from '../api'

const roleColor = { Admin:'bg-indigo-100 text-indigo-700', Manager:'bg-emerald-100 text-emerald-700', Agent:'bg-slate-100 text-slate-600' }
const roleIcon  = { Admin: Shield, Manager: UserCog, Agent: UsersIcon }

export default function Users() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getUsers()
      .then(r => setUsers(r.data))
      .catch(() => setError('ไม่สามารถเชื่อมต่อ C# API (port 5050) — ตรวจสอบว่า backend รันอยู่'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ทีม CRM</h1>
        <p className="text-slate-500 text-sm mt-1">
          ข้อมูลจาก <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-xs">C# .NET Core API</span> (port 5050)
        </p>
      </div>

      {/* API Badge */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <span className="text-indigo-600 font-bold text-xs">C#</span>
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-800">C# .NET Core 6 Web API</p>
          <p className="text-xs text-indigo-600">GET http://localhost:5050/api/users — MySQL direct query</p>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          ⚠️ {error}
        </div>
      )}

      {loading ? <LoadingSpinner text="เรียกข้อมูลจาก C# API..." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {users.map(u => {
            const Icon = roleIcon[u.role] || Users
            return (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon size={22} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{u.fullName}</p>
                    <p className="text-slate-400 text-xs">@{u.username}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">บทบาท</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]}`}>{u.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">แผนก</span>
                    <span className="text-slate-600 font-medium">{u.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">อีเมล</span>
                    <span className="text-slate-600 truncate ml-2">{u.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">สถานะ</span>
                    <span className={`font-medium ${u.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Login demo */}
      <LoginDemo />
    </div>
  )
}

function LoginDemo() {
  const [form, setForm]   = useState({ username:'admin', password:'demo1234' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await login(form)
      setResult({ ok: true, data: res.data })
    } catch {
      setResult({ ok: false })
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">ทดสอบ C# Auth API</h3>
      <p className="text-xs text-slate-400 mb-4">POST http://localhost:5050/api/auth/login</p>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Username</label>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}>
            {['admin','somsak','wanida','mana'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Password</label>
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <button onClick={handleLogin} disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
          {loading ? 'กำลัง Login...' : 'Login'}
        </button>
      </div>
      {result && (
        <div className={`mt-4 p-3 rounded-lg text-xs font-mono ${result.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {result.ok ? JSON.stringify(result.data, null, 2) : 'Login failed — ตรวจสอบ C# API'}
        </div>
      )}
    </div>
  )
}
