import { useState } from 'react'
import ItemImage from '../components/ItemImage'
import { ConfirmDialog, Modal } from '../components/Modal'
import Page from '../components/Page'
import Toggle from '../components/Toggle'
import { useStore } from '../store/useStore'
import { formatMoney } from '../utils/format'
import { fileToCompressedDataUrl } from '../utils/image'

const EMPTY = { name: '', price: '', image: '🍜', category: 'main', active: true }
const EMOJIS = ['🍜', '🍲', '🍚', '🍛', '🍗', '🥩', '🍖', '🍝', '🍳', '🥟', '🥤', '🧋']

export default function MenuEditor() {
  const menu = useStore((s) => s.menu)
  const currency = useStore((s) => s.settings.currency)
  const { saveItem, deleteItem, moveItem, setActive } = useStore()

  const [draft, setDraft] = useState(null) // form state, price kept as a string while typing
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const openNew = (category) => {
    setError('')
    setDraft({ ...EMPTY, category, image: category === 'addon' ? '🥩' : '🍜' })
  }
  const openEdit = (m) => {
    setError('')
    setDraft({ id: m.id, name: m.name, price: String(m.price), image: m.image, category: m.category, active: m.active })
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same photo again
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const url = await fileToCompressedDataUrl(file) // compress BEFORE storing
      setDraft((d) => d && { ...d, image: url })
    } catch {
      setError('Could not read that photo. Try another one.')
    } finally {
      setBusy(false)
    }
  }

  const onSave = async () => {
    if (!draft) return
    const price = Number(draft.price)
    if (!draft.name.trim()) return setError('Enter a name.')
    if (draft.price.trim() === '' || !Number.isFinite(price) || price < 0) return setError('Enter a valid price.')
    await saveItem({ id: draft.id, name: draft.name.trim(), price, image: draft.image, category: draft.category, active: draft.active })
    setDraft(null)
  }

  const renderList = (list) =>
    list.length === 0 ? (
      <p className="card text-sm text-stone-500">Nothing here yet.</p>
    ) : (
      list.map((m, i) => (
        <div key={m.id} className={`card flex flex-col gap-2 ${m.active ? '' : 'opacity-60'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3f0e8]">
              <ItemImage image={m.image} size="2.5rem" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold text-[#29342e]">{m.name}</div>
              <div className="text-base font-bold text-[#a94930]">{formatMoney(m.price, currency)}</div>
            </div>
            <Toggle checked={m.active} label={`${m.name} shown on sell screen`} onChange={(v) => setActive(m.id, v)} />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" disabled={i === 0} aria-label="Move up" onClick={() => moveItem(m.id, -1)}>▲</button>
            <button type="button" className="btn btn-ghost" disabled={i === list.length - 1} aria-label="Move down" onClick={() => moveItem(m.id, 1)}>▼</button>
            <button type="button" className="btn btn-dark flex-1" onClick={() => openEdit(m)}>Edit</button>
            <button type="button" className="btn btn-ghost text-[#a83e35]" aria-label={`Delete ${m.name}`} onClick={() => setToDelete(m)}>Delete</button>
          </div>
        </div>
      ))
    )

  const mains = menu.filter((m) => m.category === 'main')
  const addons = menu.filter((m) => m.category === 'addon')

  return (
    <Page title="Menu">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[#29342e]">Main dishes</h2>
        <button type="button" className="btn btn-primary" onClick={() => openNew('main')}>＋ Add dish</button>
      </div>
      {renderList(mains)}

      <div className="mt-2 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[#29342e]">Add-ons</h2>
        <button type="button" className="btn btn-primary" onClick={() => openNew('addon')}>＋ Add add-on</button>
      </div>
      {renderList(addons)}

      {draft && (
        <Modal open title={draft.id ? 'Edit item' : 'New item'} onClose={() => setDraft(null)}>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 font-bold">
              Name
              <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 font-bold">
              Price ({currency})
              <input
                className="input"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              />
            </label>

            <div className="flex gap-2" role="radiogroup" aria-label="Category">
              {['main', 'addon'].map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={draft.category === c}
                  onClick={() => setDraft({ ...draft, category: c })}
                  className={`btn flex-1 ${draft.category === c ? 'btn-dark' : 'btn-ghost'}`}
                >
                  {c === 'main' ? 'Main dish' : 'Add-on'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <ItemImage image={draft.image} size="4rem" />
              <div className="flex flex-1 gap-2">
                <label className="btn btn-ghost flex-1 cursor-pointer">
                  Camera
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
                </label>
                <label className="btn btn-ghost flex-1 cursor-pointer">
                  Gallery
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
              </div>
            </div>
            {busy && <p className="font-bold text-stone-600">Preparing photo…</p>}

            <div className="flex flex-wrap gap-1">
              {EMOJIS.map((e) => (
                <button key={e} type="button" aria-label={`Use ${e}`} onClick={() => setDraft({ ...draft, image: e })} className="h-[60px] w-[60px] touch-manipulation rounded-xl border-2 border-stone-200 text-3xl active:scale-95">
                  {e}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Show on sell screen</span>
              <Toggle checked={draft.active} label="Active" onChange={(v) => setDraft({ ...draft, active: v })} />
            </div>

            {error && <p className="font-bold text-red-700">{error}</p>}

            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setDraft(null)}>Cancel</button>
              <button type="button" className="btn btn-green flex-1" disabled={busy} onClick={onSave}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Delete item?"
        message={`"${toDelete?.name ?? ''}" will be removed from the menu. Past orders keep their records.`}
        confirmLabel="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteItem(toDelete.id)
          setToDelete(null)
        }}
      />
    </Page>
  )
}
