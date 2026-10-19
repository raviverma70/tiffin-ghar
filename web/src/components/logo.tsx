export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#ea580c" />
        <rect x="12" y="24" width="40" height="26" rx="5" fill="#ffffff" />
        <rect x="16" y="18" width="32" height="8" rx="3" fill="#ffedd5" />
        <path d="M26 18v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 37h40" stroke="#ea580c" strokeWidth="3" />
      </svg>
      <span className="text-lg font-bold text-orange-700">Tiffin Ghar</span>
    </span>
  );
}