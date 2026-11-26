export default function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Logotipo de Sur Digital"
    >
      <rect width="64" height="64" rx="18" fill="#1b2a41" />
      <circle cx="20" cy="32" r="8" fill="#2ec4b6" />
      <circle cx="46" cy="18" r="6" fill="#f2b134" />
      <circle cx="46" cy="46" r="6" fill="#f2b134" />
      <path d="M20 32 46 18M20 32l26 14" stroke="#f3f5f7" strokeWidth="3" />
    </svg>
  )
}
