export function Logo({ claro = false, compacto = false }: { claro?: boolean; compacto?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        <rect width="36" height="36" rx="11" fill={claro ? "#ffffff" : "#0E3B43"} />
        <circle cx="18" cy="18" r="10" fill="none" stroke={claro ? "#0E3B43" : "#ffffff"} strokeOpacity="0.35" strokeWidth="1.5" />
        <path d="M18 7.5 L21.2 18 L18 28.5 L14.8 18 Z" fill={claro ? "#0E3B43" : "#ffffff"} fillOpacity="0.9" />
        <path d="M18 7.5 L21.2 18 L14.8 18 Z" fill="#D9A21B" />
        <circle cx="18" cy="18" r="2" fill={claro ? "#ffffff" : "#0E3B43"} />
      </svg>
      {!compacto && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-[1.12rem] font-bold ${claro ? "text-white" : "text-ink"}`}>GPS Financeiro</span>
          <span className={`mt-1 text-[11px] font-semibold ${claro ? "text-white/55" : "text-ink-mute"}`}>R7 Investimentos</span>
        </span>
      )}
    </span>
  );
}
