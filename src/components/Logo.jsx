/** Marca de CxP360: un anillo de 360° alrededor de las siglas. */
export function Logo({ claro = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 64 64" className="size-10 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill={claro ? '#ffffff' : '#0f172a'} />
        <circle
          cx="32" cy="32" r="19" fill="none" stroke="#f97316" strokeWidth="5"
          strokeDasharray="100 20" strokeLinecap="round" transform="rotate(-60 32 32)"
        />
        <text x="32" y="38" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700" fill={claro ? '#0f172a' : '#ffffff'}>
          CxP
        </text>
      </svg>
      <div className="leading-tight">
        <p className={`text-lg font-bold tracking-tight ${claro ? 'text-slate-900' : 'text-white'}`}>
          CxP<span className="text-orange-500">360</span>
        </p>
        <p className={`text-xs ${claro ? 'text-slate-500' : 'text-slate-400'}`}>Ferretería Los Esclavos</p>
      </div>
    </div>
  )
}
