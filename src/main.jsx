import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import App from './App'
import './index.css'

// Registers the service worker; new versions install silently and activate on the next visit
registerSW({ immediate: true })
// --- Persistent Storage Request ---
// Asks the browser to NOT auto-delete this app's IndexedDB data.
// Must be called from a user-visible context (app load counts).
async function requestPersistentStorage() {
  if (!navigator.storage || !navigator.storage.persist) {
    console.warn('[Storage] Persistent Storage API not supported on this browser.')
    return
  }

  try {
    // Check if already granted (avoids asking every time)
    const alreadyGranted = await navigator.storage.persisted()
    if (alreadyGranted) {
      console.log('[Storage] ✅ Already persistent. Data is safe from auto-eviction.')
      return
    }

    // Ask the browser
    const granted = await navigator.storage.persist()
    if (granted) {
      console.log('[Storage] ✅ Persistent storage GRANTED. Data protected.')
    } else {
      console.warn('[Storage] ❌ Persistent storage DENIED. Data could be auto-deleted under storage pressure.')
    }
  } catch (err) {
    console.warn('[Storage] Failed to request persistent storage:', err)
  }
}

requestPersistentStorage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
) 
