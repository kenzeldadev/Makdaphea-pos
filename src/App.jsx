import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import MenuEditor from './pages/MenuEditor'
import SettingsPage from './pages/Settings'
import TapScreen from './pages/TapScreen'
import { useStore } from './store/useStore'

export default function App() {
  const init = useStore((s) => s.init)
  const ready = useStore((s) => s.ready)

  useEffect(() => {
    init()
  }, [init])

  if (!ready) return <div className="grid h-full place-items-center text-2xl font-bold">Loading…</div>

  return (
    <BrowserRouter>
      <div className="flex h-dvh flex-col">
        <NavBar />
        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<TapScreen />} />
            <Route path="/menu" element={<MenuEditor />} />
            <Route path="/history" element={<History />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
