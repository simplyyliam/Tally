/** Tally's mark: four strokes and a slash, on the lime square from the sidebar reference. */
export function BrandMark({ className = "size-6" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-[7px] bg-brand text-ink shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)] ${className}`}>
      <svg viewBox="0 0 24 24" className="size-[70%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
        <path d="M7 6v12M10.5 6v12M14 6v12M17.5 6v12" />
        <path d="M5 16 19.5 8" />
      </svg>
    </span>
  )
}
