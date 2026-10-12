import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../components/Modal'
import Page from '../components/Page'
import Toggle from '../components/Toggle'
import { useStore } from '../store/useStore'
import { exportCSV, exportJSON, importJSON } from '../utils/exportData'

const CURRENCIES = [
  ['USD', '$ US Dollar'],
  ['KHR', '៛ Riel'],
]

export default function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const { setSetting, init, resetData } = useStore()
  const [shopName, setShopName] = useState(settings.shopName)
  const [pendingImport, setPendingImport] = useState(null) // File waiting for confirmation
  const [confirmReset, setConfirmReset] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setShopName(settings.shopName)
  }, [settings.shopName])

  // Runs an async action and shows its returned text (or the error) under the buttons
  const run = async (fn) => {
    try {
      setMessage(await fn())
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  const onPickImport = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) setPendingImport(f)
  }

  return (
    <Page title="Settings">
      <div className="card flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-lg font-bold">
          Shop name
          <input
            className="input"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            onBlur={() => setSetting('shopName', shopName.trim() || 'Noodle Shop')}
          />
        </label>

        <div>
          <div className="mb-1 text-lg font-bold">Currency</div>
          <div className="flex gap-2" role="radiogroup" aria-label="Currency">
            {CURRENCIES.map(([code, label]) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={settings.currency === code}
                className={`btn flex-1 ${settings.currency === code ? 'btn-dark' : 'btn-ghost'}`}
                onClick={() => setSetting('currency', code)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-stone-600">Prices are stored in USD and displayed in the selected currency.</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Tap sound</span>
          <Toggle checked={settings.soundOn} label="Tap sound" onChange={(v) => setSetting('soundOn', v)} />
        </div>
      </div>

      <div className="card flex flex-col gap-2">
        <h2 className="text-xl font-extrabold">Backup</h2>
        <p className="text-stone-600">Everything is stored on this tablet. Export a backup regularly.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-dark flex-1"
            onClick={() => run(async () => { await exportJSON(); return 'Backup file saved.' })}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="btn btn-dark flex-1"
            onClick={() => run(async () => { await exportCSV(); return 'Orders CSV saved.' })}
          >
            Export CSV
          </button>
          <label className="btn btn-ghost flex-1 cursor-pointer">
            Import JSON
            <input type="file" accept="application/json,.json" className="hidden" onChange={onPickImport} />
          </label>
        </div>
        {message && <p className="text-lg font-bold text-green-700">{message}</p>}
      </div>

      <div className="card flex flex-col gap-2">
        <h2 className="text-xl font-extrabold text-red-700">Danger zone</h2>
        <button type="button" className="btn btn-danger" onClick={() => setConfirmReset(true)}>
          Reset all data
        </button>
      </div>

      <ConfirmDialog
        open={!!pendingImport}
        danger
        title="Import backup?"
        message="This replaces the current menu, orders and settings with the backup file."
        confirmLabel="Import"
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          const file = pendingImport
          setPendingImport(null)
          if (!file) return
          run(async () => {
            const r = await importJSON(file)
            await init()
            return `Imported ${r.menu} items and ${r.orders} orders.`
          })
        }}
      />
      <ConfirmDialog
        open={confirmReset}
        danger
        title="Delete everything?"
        message="All orders, menu changes and settings will be erased and the default menu restored. This cannot be undone."
        confirmLabel="Erase all"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false)
          run(async () => {
            await resetData()
            return 'All data erased.'
          })
        }}
      />
    </Page>
  )
}
