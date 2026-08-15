#!/usr/bin/env python3
"""Generate Handpan icon + synthetic tone samples for Amazfit Bip Max app."""

import math
import os
import struct
import wave
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets", "bip-max")
SOUNDS = os.path.join(ASSETS, "sounds")

NOTES = {
    "ding": 146.83,  # D3
    "a3": 220.00,    # A3
    "bb3": 233.08,   # Bb3
    "c4": 261.63,    # C4
    "d4": 293.66,    # D4
    "e4": 329.63,    # E4
    "f4": 349.23,    # F4
    "g4": 392.00,    # G4
    "a4": 440.00,    # A4
}

SR = 22050
DURATION = 1.4


def synth_wav(freq: float, path: str) -> None:
    n = int(SR * DURATION)
    samples = []
    for i in range(n):
        t = i / SR
        env = (1 - math.exp(-t * 80)) * math.exp(-t * 2.2)
        s = (
            0.55 * math.sin(2 * math.pi * freq * t)
            + 0.28 * math.sin(2 * math.pi * freq * 2 * t)
            + 0.12 * math.sin(2 * math.pi * freq * 3 * t)
            + 0.05 * math.sin(2 * math.pi * freq * 4.02 * t)
        )
        val = max(-1.0, min(1.0, s * env * 0.85))
        samples.append(int(val * 32767))
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(struct.pack("<" + "h" * len(samples), *samples))


def to_mp3(wav_path: str, mp3_path: str) -> None:
    cmd = [
        "ffmpeg", "-y", "-i", wav_path,
        "-codec:a", "libmp3lame", "-b:a", "96k",
        "-ar", str(SR), "-ac", "1", mp3_path,
    ]
    subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def make_icon(path: str) -> None:
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        # fallback: solid PNG via minimal writer
        # create simple teal circle on dark bg using ImageMagick if available
        try:
            subprocess.check_call([
                "convert", "-size", "192x192", "xc:#0d1117",
                "(", "-size", "160x160", "xc:none", "-fill", "#2d333b",
                "-draw", "circle 80,80 80,8", ")", "-gravity", "center", "-compose", "over", "-composite",
                "(", "-size", "48x48", "xc:none", "-fill", "#1abc9c",
                "-draw", "circle 24,24 24,2", ")", "-gravity", "center", "-compose", "over", "-composite",
                path,
            ])
            return
        except Exception as e:
            print("Icon generation failed (install pillow or imagemagick):", e)
            return

    img = Image.new("RGBA", (192, 192), (13, 17, 23, 255))
    d = ImageDraw.Draw(img)
    d.ellipse((16, 16, 176, 176), fill=(45, 51, 59, 255))
    d.ellipse((26, 26, 166, 166), fill=(61, 68, 77, 255))
    d.ellipse((72, 72, 120, 120), fill=(26, 188, 156, 255))
    d.ellipse((86, 86, 106, 106), fill=(13, 17, 23, 255))
    img.save(path, "PNG")


def main() -> None:
    os.makedirs(SOUNDS, exist_ok=True)
    make_icon(os.path.join(ASSETS, "icon.png"))
    print("icon.png ready")

    for name, freq in NOTES.items():
        wav = os.path.join(SOUNDS, f"{name}.wav")
        mp3 = os.path.join(SOUNDS, f"{name}.mp3")
        synth_wav(freq, wav)
        try:
            to_mp3(wav, mp3)
            os.remove(wav)
            print(f"{name}.mp3 ready")
        except Exception as e:
            print(f"ffmpeg failed for {name}, left wav: {e}")

    print("Done. Assets in", ASSETS)


if __name__ == "__main__":
    main()
