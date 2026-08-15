import { createWidget, widget, align, text_style, prop } from '@zos/ui'
import { create, id } from '@zos/media'

const W = 432
const H = 514

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

Page({
  state: {
    noteWidgets: [],
    players: []
  },

  build() {
    const cx = Math.floor(W / 2)
    const cy = Math.floor(H / 2) + 6
    const maxR = Math.floor(Math.min(W, H) * 0.48)

    createWidget(widget.FILL_RECT, {
      x: 0, y: 0, w: W, h: H, color: 0x0a0a0a
    })

    createWidget(widget.CIRCLE, {
      center_x: cx, center_y: cy, radius: maxR, color: 0x1e242c
    })

    this.state.noteWidgets = []
    this.state.players = []

    for (let i = 0; i < NOTES.length; i++) {
      let player = null
      try {
        player = create(id.PLAYER)
        player.addEventListener(player.event.PREPARE, (result) => {
          if (result) {
            try { player.start() } catch (e) {}
          }
        })
      } catch (e) {
        player = null
      }
      this.state.players.push(player)
    }

    const dingR = Math.floor(maxR * 0.34)
    this.addZone(0, cx, cy, dingR, NOTES[0])

    const ringDist = maxR * 0.62
    const ringR = Math.floor(maxR * 0.22)
    for (let i = 1; i < NOTES.length; i++) {
      const note = NOTES[i]
      const rad = (note.angle * Math.PI) / 180
      const nx = Math.floor(cx + ringDist * Math.cos(rad))
      const ny = Math.floor(cy + ringDist * Math.sin(rad))
      this.addZone(i, nx, ny, ringR, note)
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

    let player = this.state.players[index]
    if (!player) {
      for (let i = 0; i < this.state.players.length; i++) {
        if (this.state.players[i]) {
          player = this.state.players[i]
          break
        }
      }
    }
    if (!player) return

    try {
      try { player.stop() } catch (e) {}
      player.setSource(player.source.FILE, { file: item.note.file })
      player.prepare()
    } catch (e) {}
  },

  onDestroy() {
    const players = this.state.players || []
    for (let i = 0; i < players.length; i++) {
      if (players[i]) {
        try { players[i].stop() } catch (e) {}
      }
    }
  }
})
