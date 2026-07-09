export function BrandMark({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="10"
        stroke="var(--amber)"
        strokeWidth="1.4"
      />
      <path
        d="M10 30 L18 20 L26 26 L38 12"
        stroke="var(--ivory)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="12" r="2.4" fill="var(--amber)" />
    </svg>
  );
}

export function TopBrand() {
  return (
    <div className="absolute top-5 left-6 flex items-center gap-2">
      <BrandMark size={16} />
      <span className="font-fraunces text-[15px] font-semibold tracking-wide">
        SaaS<em className="text-muted font-medium not-italic italic">ok</em>
      </span>
    </div>
  );
}
