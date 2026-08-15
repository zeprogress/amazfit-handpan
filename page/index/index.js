import { createWidget, widget, align, text_style, prop, event } from '@zos/ui'
import { create, id } from '@zos/media'
import { getDeviceInfo } from '@zos/device'
import { Vibrator, VIBRATOR_SCENE_SHORT_LIGHT } from '@zos/sensor'
import { setTimeout } from '@zos/timer'

// === D Kurd scale ===
const SCALES = [
  {
    name: 'D Kurd',
    notes: [
      { name: 'Ding', file: 'sounds/ding.mp3',  x: 0.50, y: 0.50, r: 0.17, color: 0x1abc9c },
      { name: 'A3',   file: 'sounds/a3.mp3',    x: 0.28, y: 0.30, r: 0.12, color: 0x3498db },
      { name: 'Bb3',  file: 'sounds/bb3.mp3',   x: 0.72, y: 0.30, r: 0.12, color: 0x9b59b6 },
      { name: 'C4',   file: 'sounds/c4.mp3',    x: 0.18, y: 0.52, r: 0.11, color: 0xe67e22 },
      { name: 'D4',   file: 'sounds/d4.mp3',    x: 0.82, y: 0.52, r: 0.11, color: 0xe74c3c },
      { name: 'E4',   file: 'sounds/e4.mp3',    x: 0.28, y: 0.72, r: 0.11, color: 0xf1c40f },
      { name: 'F4',   file: 'sounds/f4.mp3',    x: 0.50, y: 0.78, r: 0.12, color: 0x2ecc71 },
      { name: 'G4',   file: 'sounds/g4.mp3',    x: 0.72, y: 0.72, r: 0.11, color: 0x1abc9c },
      { name: 'A4',   file: 'sounds/a4.mp3',    x: 0.50, y: 0.22, r: 0.11, color: 0x3498db }
    ]
  }
]

Page({
  state: {
    player: null,
    vibrator: null,
    noteWidgets: [],
    scaleIndex: 0,
    width: 432,
    height: 514,
    isPlaying: false
  },

  onInit() {
    console.log('Handpan page init')
  },

  build() {
    const device = getDeviceInfo()
    this.state.width = device.width || 432
    this.state.height = device.height || 514

    const W = this.state.width
    const H = this.state.height
    const cx = W / 2
    const cy = H / 2 - 10
    const maxR = Math.min(W, H) * 0.46

    createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: W,
      h: H,
      color: 0x0d1117
    })

    createWidget(widget.CIRCLE, {
      center_x: cx,
      center_y: cy,
      radius: maxR + 8,
      color: 0x21262d,
      line_width: 0
    })

    createWidget(widget.CIRCLE, {
      center_x: cx,
      center_y: cy,
      radius: maxR,
      color: 0x2d333b,
      line_width: 0
    })

    createWidget(widget.CIRCLE, {
      center_x: cx,
      center_y: cy,
      radius: maxR,
      color: 0x484f58,
      line_width: 3
    })

    createWidget(widget.TEXT, {
      x: 0,
      y: 8,
      w: W,
      h: 28,
      text: 'HANDPAN',
      text_size: 18,
      color: 0x8b949e,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    const scale = SCALES[this.state.scaleIndex]
    this.state.noteWidgets = []

    scale.notes.forEach((note, index) => {
      const nx = cx + (note.x - 0.5) * maxR * 1.75
      const ny = cy + (note.y - 0.5) * maxR * 1.75
      const nr = note.r * maxR

      createWidget(widget.CIRCLE, {
        center_x: nx,
        center_y: ny,
        radius: nr + 3,
        color: 0x161b22,
        line_width: 0
      })

      const circle = createWidget(widget.CIRCLE, {
        center_x: nx,
        center_y: ny,
        radius: nr,
        color: 0x30363d,
        line_width: 0
      })

      createWidget(widget.CIRCLE, {
        center_x: nx,
        center_y: ny,
        radius: nr * 0.55,
        color: 0x21262d,
        line_width: 0
      })

      createWidget(widget.TEXT, {
        x: nx - 32,
        y: ny - 11,
        w: 64,
        h: 22,
        text: note.name,
        text_size: note.name === 'Ding' ? 15 : 14,
        color: 0xc9d1d9,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE
      })

      createWidget(widget.BUTTON, {
        x: nx - nr - 4,
        y: ny - nr - 4,
        w: (nr + 4) * 2,
        h: (nr + 4) * 2,
        normal_color: 0x00000000,
        press_color: 0x00000000,
        text: '',
        click_func: () => {
          this.playNote(index)
        }
      })

      this.state.noteWidgets.push({
        circle,
        note,
        nx,
        ny,
        nr,
        baseColor: 0x30363d,
        highlightColor: note.color
      })
    })

    createWidget(widget.TEXT, {
      x: 0,
      y: H - 36,
      w: W,
      h: 24,
      text: 'D Kurd  \u2022  tap zones',
      text_size: 14,
      color: 0x484f58,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    try {
      this.state.player = create(id.PLAYER)

      this.state.player.addEventListener(this.state.player.event.PREPARE, (result) => {
        if (result) {
          this.state.player.start()
        } else {
          console.log('prepare failed')
        }
      })

      this.state.player.addEventListener(this.state.player.event.COMPLETE, () => {
        this.state.isPlaying = false
        try {
          this.state.player.stop()
        } catch (e) {}
      })
    } catch (e) {
      console.log('Media init error:', e)
    }

    try {
      this.state.vibrator = new Vibrator()
    } catch (e) {
      console.log('Vibrator not available')
    }
  },

  playNote(index) {
    const item = this.state.noteWidgets[index]
    if (!item) return

    try {
      item.circle.setProperty(prop.COLOR, item.highlightColor)
      setTimeout(() => {
        try {
          item.circle.setProperty(prop.COLOR, item.baseColor)
        } catch (e) {}
      }, 220)
    } catch (e) {}

    if (this.state.vibrator) {
      try {
        this.state.vibrator.start({ mode: VIBRATOR_SCENE_SHORT_LIGHT })
      } catch (e) {}
    }

    const player = this.state.player
    if (!player) return

    try {
      if (this.state.isPlaying) {
        player.stop()
      }
      this.state.isPlaying = true
      player.setSource(player.source.FILE, {
        file: item.note.file
      })
      player.prepare()
    } catch (e) {
      console.log('Play error:', e)
      this.state.isPlaying = false
    }
  },

  onDestroy() {
    if (this.state.player) {
      try {
        this.state.player.stop()
      } catch (e) {}
    }
  }
})
