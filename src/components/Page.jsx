// Scrollable page wrapper for every screen except the tap screen (which never scrolls).
export default function Page({ title, actions, children }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 pb-10 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-[#e2e0d9] pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#202923]">{title}</h1>
          {actions}
        </div>
        {children}
      </div>
    </div>
  )
}
