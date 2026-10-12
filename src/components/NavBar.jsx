import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useStore } from '../store/useStore'

const LINKS = [
  { to: '/', label: 'Sell', icon: 'sell' },
  { to: '/menu', label: 'Menu', icon: 'menu' },
  { to: '/history', label: 'History', icon: 'history' },
  { to: '/dashboard', label: 'Stats', icon: 'stats' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

function NavIcon({ name }) {
  const paths = {
    sell: <><path d="M4 7h16l-1.2 13H5.2L4 7Z" /><path d="M8 7a4 4 0 0 1 8 0M9 11v5m6-5v5" /></>,
    menu: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    history: <><path d="M4 7v5h5" /><path d="M5.5 11a7 7 0 1 0 2-4.9L4 12" /><path d="M12 8v4l3 2" /></>,
    stats: <><path d="M4 19V5m0 14h16" /><path d="M8 16v-5m4 5V7m4 9v-8" /></>,
    settings: <><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.4-.5a8 8 0 0 1-1.5.9l-.2 1.5h-2.4l-.3-1.5a8 8 0 0 1-1.6-.9l-1.4.5-1.2-2.1 1.2-.9a7 7 0 0 1 0-1.8l-1.2-.9 1.2-2.1 1.4.5a8 8 0 0 1 1.6-.9l.3-1.5h2.4l.2 1.5a8 8 0 0 1 1.5.9l1.4-.5 1.2 2.1-1.2.9a7 7 0 0 1-.1 1.7Z" transform="translate(-2 -1)" /></>,
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      {paths[name]}
    </svg>
  )
}

export default function NavBar() {
  const shopName = useStore((s) => s.settings.shopName)
  return (
    <nav className="flex h-[68px] shrink-0 items-stretch bg-[#202923] text-white shadow-[0_2px_12px_rgba(20,27,23,0.16)]">
      <div className="hidden min-w-0 items-center gap-3 px-6 lg:flex">
        <img src={logo} alt="" className="h-8 w-8 rounded-lg" />
        <span className="max-w-[12rem] truncate text-base font-bold tracking-wide">{shopName}</span>
      </div>
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `relative flex flex-1 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-semibold tracking-wide text-white/65 transition-colors active:bg-white/10 sm:flex-row sm:gap-2 sm:text-sm lg:flex-initial lg:px-5 ${
              isActive ? 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-[#e7a16f]' : ''
            }`
          }
        >
          <NavIcon name={l.icon} />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
