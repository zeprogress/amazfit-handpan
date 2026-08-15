import { createWidget, widget, align, text_style, prop } from '@zos/ui'
import { create, id } from '@zos/media'
import { getDeviceInfo } from '@zos/device'
import { Vibrator, VIBRATOR_SCENE_SHORT_LIGHT } from '@zos/sensor'

const NOTES = [
  { name: 'Ding', file: 'sounds/ding.mp3', x: 0.50, y: 0.50, r: 0.16, color: 0x1abc9c },
  { name: 'A3',   file: 'sounds/a3.mp3',   x: 0.28, y: 0.30, r: 0.11, color: 0x3498db },
  { name: 'Bb3',  file: 'sounds/bb3.mp3',  x: 0.72, y: 0.30, r: 0.11, color: 0x9b59b6 },
  { name: 'C4',   file: 'sounds/c4.mp3',   x: 0.18, y: 0.52, r: 0.10, color: 0xe67e22 },
  { name: 'D4',   file: 'sounds/d4.mp3',   x: 0.82, y: 0.52, r: 0.10, color: 0xe74c3c },
  { name: 'E4',   file: 'sounds/e4.mp3',   x: 0.28, y: 0.72, r: 0.10, color: 0xf1c40f },
  { name: 'F4',   file: 'sounds/f4.mp3',   x: 0.50, y: 0.78, r: 0.11, color: 0x2ecc71 },
  { name: 'G4',   file: 'sounds/g4.mp3',   x: 0.72, y: 0.72, r: 0.10, color: 0x1abc9c },
  { name: 'A4',   file: 'sounds/a4.mp3',   x: 0.50, y: 0.22, r: 0.10, color: 0x3498db }
]

Page({
  state: {
    player: null,
    vibrator: null,
    noteWidgets: [],
    isPlaying: false
  },

  build() {
    let W = 432
    let H = 514
    try {
      const info = getDeviceInfo()
      if (info && info.width) W = info.width
      if (info && info.height) H = info.height
    } catch (e) {}

    const cx = Math.floor(W / 2)
    const cy = Math.floor(H / 2)
    const maxR = Math.floor(Math.min(W, H) * 0.42)

    // Background - always visible
    createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: W,
      h: H,
      color: 0x111111
    })

    // Main disc
    createWidget(widget.CIRCLE, {
      center_x: cx,
      center_y: cy,
      radius: maxR,
      color: 0x2d333b
    })

    // Title
    createWidget(widget.TEXT, {
      x: 0,
      y: 12,
      w: W,
      h: 30,
      text: 'HANDPAN',
      text_size: 20,
      color: 0xffffff,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    this.state.noteWidgets = []

    for (let i = 0; i < NOTES.length; i++) {
      const note = NOTES[i]
      const nx = Math.floor(cx + (note.x - 0.5) * maxR * 1.7)
      const ny = Math.floor(cy + (note.y - 0.5) * maxR * 1.7)
      const nr = Math.floor(note.r * maxR)

      const circle = createWidget(widget.CIRCLE, {
        center_x: nx,
        center_y: ny,
        radius: nr,
        color: 0x3d4450
      })

      createWidget(widget.TEXT, {
        x: nx - 28,
        y: ny - 10,
        w: 56,
        h: 20,
        text: note.name,
        text_size: 14,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE
      })

      // Visible tappable button
      createWidget(widget.BUTTON, {
        x: nx - nr,
        y: ny - nr,
        w: nr * 2,
        h: nr * 2,
        radius: nr,
        normal_color: 0x3d4450,
        press_color: note.color,
        text: '',
        click_func: () => {
          this.playNote(i)
        }
      })

      this.state.noteWidgets.push({
        circle: circle,
        note: note,
        baseColor: 0x3d4450,
        highlightColor: note.color
      })
    }

    createWidget(widget.TEXT, {
      x: 0,
      y: H - 40,
      w: W,
      h: 28,
      text: 'D Kurd - tap zones',
      text_size: 16,
      color: 0x888888,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    // Lazy init sensors (do not crash build)
    try {
      this.state.vibrator = new Vibrator()
    } catch (e) {
      this.state.vibrator = null
    }
  },

  ensurePlayer() {
    if (this.state.player) return this.state.player
    try {
      const player = create(id.PLAYER)
      player.addEventListener(player.event.PREPARE, (result) => {
        if (result) {
          try { player.start() } catch (e) {}
        }
      })
      player.addEventListener(player.event.COMPLETE, () => {
        this.state.isPlaying = false
        try { player.stop() } catch (e) {}
      })
      this.state.player = player
      return player
    } catch (e) {
      return null
    }
  },

  playNote(index) {
    const item = this.state.noteWidgets[index]
    if (!item) return

    // Highlight
    try {
      item.circle.setProperty(prop.MORE, { color: item.highlightColor })
      setTimeout(() => {
        try {
          item.circle.setProperty(prop.MORE, { color: item.baseColor })
        } catch (e) {}
      }, 200)
    } catch (e) {}

    // Vibrate
    if (this.state.vibrator) {
      try {
        this.state.vibrator.start({ mode: VIBRATOR_SCENE_SHORT_LIGHT })
      } catch (e) {}
    }

    // Sound
    const player = this.ensurePlayer()
    if (!player) return

    try {
      if (this.state.isPlaying) {
        try { player.stop() } catch (e) {}
      }
      this.state.isPlaying = true
      player.setSource(player.source.FILE, { file: item.note.file })
      player.prepare()
    } catch (e) {
      this.state.isPlaying = false
    }
  },

  onDestroy() {
    if (this.state.player) {
      try { this.state.player.stop() } catch (e) {}
    }
  }
})
