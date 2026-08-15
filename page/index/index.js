import { createWidget, widget, align, text_style, prop } from '@zos/ui'
import { create, id } from '@zos/media'

const W = 432
const H = 514

// Large zones: Ding center, 8 notes on a wide ring
const NOTES = [
  { name: 'Ding', file: 'sounds/ding.mp3', kind: 'ding', color: 0x1abc9c },
  { name: 'A4',   file: 'sounds/a4.mp3',   kind: 'ring', angle: -90,  color: 0x3498db },
  { name: 'Bb3',  file: 'sounds/bb3.mp3',  kind: 'ring', angle: -45,  color: 0x9b59b6 },
  { name: 'D4',   file: 'sounds/d4.mp3',   kind: 'ring', angle: 0,    color: 0xe74c3c },
  { name: 'G4',   file: 'sounds/g4.mp3',   kind: 'ring', angle: 45,   color: 0x1abc9c },
  { name: 'F4',   file: 'sounds/f4.mp3',   kind: 'ring', angle: 90,   color: 0x2ecc71 },
  { name: 'E4',   file: 'sounds/e4.mp3',   kind: 'ring', angle: 135,  color: 0xf1c40f },
  { name: 'C4',   file: 'sounds/c4.mp3',   kind: 'ring', angle: 180,  color: 0xe67e22 },
  { name: 'A3',   file: 'sounds/a3.mp3',   kind: 'ring', angle: 225,  color: 0x3498db }
]

const POOL_SIZE = 4

Page({
  state: {
    players: [],
    nextPlayer: 0,
    noteWidgets: []
  },

  build() {
    const cx = Math.floor(W / 2)
    const cy = Math.floor(H / 2) + 10
    const maxR = Math.floor(Math.min(W, H) * 0.46)

    createWidget(widget.FILL_RECT, {
      x: 0, y: 0, w: W, h: H, color: 0x0e0e0e
    })

    createWidget(widget.CIRCLE, {
      center_x: cx, center_y: cy, radius: maxR + 4, color: 0x1a1f26
    })
    createWidget(widget.CIRCLE, {
      center_x: cx, center_y: cy, radius: maxR, color: 0x252b33
    })

    createWidget(widget.TEXT, {
      x: 0, y: 4, w: W, h: 24,
      text: 'HANDPAN',
      text_size: 16,
      color: 0x777777,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    this.state.noteWidgets = []

    // Ding - large center
    const dingR = Math.floor(maxR * 0.28)
    this.addZone(0, cx, cy, dingR, NOTES[0])

    // Ring notes - large, near edge
    const ringDist = maxR * 0.68
    const ringR = Math.floor(maxR * 0.18)
    for (let i = 1; i < NOTES.length; i++) {
      const note = NOTES[i]
      const rad = (note.angle * Math.PI) / 180
      const nx = Math.floor(cx + ringDist * Math.cos(rad))
      const ny = Math.floor(cy + ringDist * Math.sin(rad))
      this.addZone(i, nx, ny, ringR, note)
    }

    createWidget(widget.TEXT, {
      x: 0, y: H - 32, w: W, h: 24,
      text: 'D Kurd',
      text_size: 14,
      color: 0x555555,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    // Audio pool for polyphony
    this.state.players = []
    this.state.nextPlayer = 0
    for (let p = 0; p < POOL_SIZE; p++) {
      try {
        const player = create(id.PLAYER)
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
      color: 0x3a424d
    })

    createWidget(widget.TEXT, {
      x: nx - 36,
      y: ny - 12,
      w: 72,
      h: 24,
      text: note.name,
      text_size: note.name === 'Ding' ? 18 : 16,
      color: 0xffffff,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    createWidget(widget.BUTTON, {
      x: nx - nr,
      y: ny - nr,
      w: nr * 2,
      h: nr * 2,
      radius: nr,
      normal_color: 0x3a424d,
      press_color: note.color,
      text: '',
      click_func: () => {
        this.playNote(index)
      }
    })

    this.state.noteWidgets.push({
      circle: circle,
      note: note,
      baseColor: 0x3a424d,
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
      }, 180)
    } catch (e) {}

    const players = this.state.players
    if (!players || players.length === 0) return

    // Round-robin: do not stop other notes -> polyphony
    const player = players[this.state.nextPlayer % players.length]
    this.state.nextPlayer = (this.state.nextPlayer + 1) % players.length

    try {
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
