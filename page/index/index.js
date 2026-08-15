import { createWidget, widget, align, text_style, prop } from '@zos/ui'
import { create, id } from '@zos/media'

const W = 432
const H = 514

// 8 notes on ring + center Ding — maximal fill
const NOTES = [
  { name: 'Ding', file: 'sounds/ding.mp3', color: 0x1abc9c },
  { name: 'A4',   file: 'sounds/a4.mp3',   angle: -90,  color: 0x3498db },
  { name: 'Bb3',  file: 'sounds/bb3.mp3',  angle: -45,  color: 0x9b59b6 },
  { name: 'D4',   file: 'sounds/d4.mp3',   angle: 0,    color: 0xe74c3c },
  { name: 'G4',   file: 'sounds/g4.mp3',   angle: 45,   color: 0x1abc9c },
  { name: 'F4',   file: 'sounds/f4.mp3',   angle: 90,   color: 0x2ecc71 },
  { name: 'E4',   file: 'sounds/e4.mp3',   angle: 135,  color: 0xf1c40f },
  { name: 'C4',   file: 'sounds/c4.mp3',   angle: 180,  color: 0xe67e22 },
  { name: 'A3',   file: 'sounds/a3.mp3',   angle: 225,  color: 0x3498db }
]

const POOL_SIZE = 6

Page({
  state: {
    players: [],
    nextPlayer: 0,
    noteWidgets: []
  },

  build() {
    const cx = Math.floor(W / 2)
    const cy = Math.floor(H / 2) + 6
    // use almost full screen for the instrument
    const maxR = Math.floor(Math.min(W, H) * 0.48)

    createWidget(widget.FILL_RECT, {
      x: 0, y: 0, w: W, h: H, color: 0x0a0a0a
    })

    createWidget(widget.CIRCLE, {
      center_x: cx, center_y: cy, radius: maxR, color: 0x1e242c
    })

    this.state.noteWidgets = []

    // Ding — very large center
    const dingR = Math.floor(maxR * 0.34)
    this.addZone(0, cx, cy, dingR, NOTES[0])

    // Ring notes — large, close to edge, almost touching neighbors
    const ringDist = maxR * 0.62
    const ringR = Math.floor(maxR * 0.22)
    for (let i = 1; i < NOTES.length; i++) {
      const note = NOTES[i]
      const rad = (note.angle * Math.PI) / 180
      const nx = Math.floor(cx + ringDist * Math.cos(rad))
      const ny = Math.floor(cy + ringDist * Math.sin(rad))
      this.addZone(i, nx, ny, ringR, note)
    }

    // Audio pool
    this.state.players = []
    this.state.nextPlayer = 0
    for (let p = 0; p < POOL_SIZE; p++) {
      try {
        const player = create(id.PLAYER)
        const idx = p
        player.addEventListener(player.event.PREPARE, (result) => {
          if (result) {
            try { player.start() } catch (e) {}
          }
        })
        this.state.players.push(player)
      } catch (e) {}
    }
  },

  addZone(index, nx, ny, nr, note) {
    const circle = createWidget(widget.CIRCLE, {
      center_x: nx,
      center_y: ny,
      radius: nr,
      color: 0x343c48
    })

    createWidget(widget.TEXT, {
      x: nx - 40,
      y: ny - 14,
      w: 80,
      h: 28,
      text: note.name,
      text_size: note.name === 'Ding' ? 20 : 17,
      color: 0xffffff,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    // Button slightly larger than visual circle for easier hit
    const hit = nr + 6
    createWidget(widget.BUTTON, {
      x: nx - hit,
      y: ny - hit,
      w: hit * 2,
      h: hit * 2,
      radius: hit,
      normal_color: 0x343c48,
      press_color: note.color,
      text: '',
      click_func: () => {
        this.playNote(index)
      }
    })

    this.state.noteWidgets.push({
      circle: circle,
      note: note,
      baseColor: 0x343c48,
      highlightColor: note.color
    })
  },

  playNote(index) {
    const item = this.state.noteWidgets[index]
    if (!item) return

    try {
      item.circle.setProperty(prop.MORE, { color: item.highlightColor })
      setTimeout(() => {
        try {
          item.circle.setProperty(prop.MORE, { color: item.baseColor })
        } catch (e) {}
      }, 160)
    } catch (e) {}

    const players = this.state.players
    if (!players || players.length === 0) return

    const player = players[this.state.nextPlayer % players.length]
    this.state.nextPlayer = (this.state.nextPlayer + 1) % players.length

    try {
      // only stop THIS player slot, others keep sounding
      try { player.stop() } catch (e) {}
      player.setSource(player.source.FILE, { file: item.note.file })
      player.prepare()
    } catch (e) {}
  },

  onDestroy() {
    const players = this.state.players || []
    for (let i = 0; i < players.length; i++) {
      try { players[i].stop() } catch (e) {}
    }
  }
})
