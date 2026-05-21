export default function LoadingSpinner({ text = 'กำลังโหลด...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
