import { useRef } from 'react'

// One gesture, two outcomes:
//  - quick press -> onTap (fires on finger-up, so it feels instant)
//  - hold ~0.45s -> onLongPress (fires while still holding; the tap is then cancelled)
export function useLongPress(onTap, onLongPress, delay = 450) {
  const timer = useRef(undefined)
  const fired = useRef(false)
  const pressing = useRef(false)

  const stop = () => {
    window.clearTimeout(timer.current)
    timer.current = undefined
  }

  return {
    onPointerDown: () => {
      pressing.current = true
      fired.current = false
      stop()
      timer.current = window.setTimeout(() => {
        fired.current = true
        onLongPress()
      }, delay)
    },
    onPointerUp: () => {
      stop()
      if (pressing.current && !fired.current) onTap()
      pressing.current = false
    },
    // Finger slid away or the browser took over (scrolling): cancel everything
    onPointerLeave: () => {
      stop()
      pressing.current = false
    },
    onPointerCancel: () => {
      stop()
      pressing.current = false
    },
    // Android shows a context menu on long-press; suppress it
    onContextMenu: (e) => e.preventDefault(),
  }
}
