// Big on/off switch with a 60px-tall hit area.
export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-[60px] w-[88px] shrink-0 touch-manipulation"
    >
      <span className={`absolute inset-x-0 inset-y-4 rounded-full transition-colors ${checked ? 'bg-green-600' : 'bg-stone-400'}`} />
      <span className={`absolute top-3.5 h-8 w-8 rounded-full bg-white shadow transition-all ${checked ? 'left-[52px]' : 'left-1'}`} />
    </button>
  )
}
