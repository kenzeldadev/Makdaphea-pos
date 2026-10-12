let ctx = null

// Short click + haptic buzz generated with WebAudio, so no audio files are needed offline.
export function tapFeedback(soundOn, kind = 'add') {
  navigator.vibrate?.(kind === 'add' ? 12 : 20)
  if (!soundOn) return
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx ??= new AC()
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = kind === 'add' ? 880 : 520
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.09)
  } catch {
    // audio is a nice-to-have; never break a sale because of it
  }
}
