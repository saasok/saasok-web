export function NextButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className="rounded-md bg-silver px-9 py-3 font-sans text-[13.5px] font-semibold tracking-wide text-[#111] transition-all duration-150 hover:enabled:-translate-y-px hover:enabled:bg-silver-hi hover:enabled:shadow-[0_8px_20px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-30"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
