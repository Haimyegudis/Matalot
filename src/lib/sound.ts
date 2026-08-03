/* Magic sparkle chime on chore completion — WebAudio, no assets. */

let ctx: AudioContext | null = null

export function playMagic() {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    const t0 = ctx.currentTime

    // quick rising arpeggio + shimmer
    const notes = [1046.5, 1318.5, 1568, 2093] // C6 E6 G6 C7
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = i === notes.length - 1 ? 'triangle' : 'sine'
      osc.frequency.value = freq
      const start = t0 + i * 0.07
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
      osc.connect(gain).connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + 0.55)
    })

    // soft sparkle noise tail
    const len = Math.floor(ctx.sampleRate * 0.3)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
    const src = ctx.createBufferSource()
    src.buffer = buf
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 6000
    const g = ctx.createGain()
    g.gain.value = 0.08
    src.connect(hp).connect(g).connect(ctx.destination)
    src.start(t0 + 0.12)
  } catch {
    /* no audio — fine */
  }
}
