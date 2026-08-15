# Amazfit Handpan 🥁

Виртуальный хэндпан для **Amazfit Bip Max** (Zepp OS 5).

Нажимай на разные зоны экрана — и слышишь тона хэндпана (D Kurd).

## Возможности

- 9 зон (гамма **D Kurd**)
- Визуальная подсветка при ударе
- Вибрация при касании
- Круглый дизайн под хэндпан
- Экран 432×514 (Bip Max)

## Быстрый старт

```bash
git clone https://github.com/zeprogress/amazfit-handpan.git
cd amazfit-handpan

# Сгенерировать иконку + 9 звуков (нужны Python 3 и ffmpeg)
python3 scripts/generate_assets.py

# Установить Zeus CLI и открыть QR для установки на часы
npm i @zeppos/zeus-cli -g
zeus preview
```

В **Zepp App**: Профиль → Настройки → О программе → 7 раз по логотипу Zepp → режим разработчика → Сканировать QR.

## Звуки и иконка

Скрипт `scripts/generate_assets.py` создаёт:

- `assets/bip-max/icon.png` — иконка приложения
- `assets/bip-max/sounds/*.mp3` — 9 синтетических тонов хэндпана (fundamental + octave + fifth)

Частоты (A4=440):

| Файл | Нота | Hz |
|--------|------|-----|
| ding.mp3 | D3 | 146.83 |
| a3.mp3 | A3 | 220.00 |
| bb3.mp3 | Bb3 | 233.08 |
| c4.mp3 | C4 | 261.63 |
| d4.mp3 | D4 | 293.66 |
| e4.mp3 | E4 | 329.63 |
| f4.mp3 | F4 | 349.23 |
| g4.mp3 | G4 | 392.00 |
| a4.mp3 | A4 | 440.00 |

Можно заменить файлы на реальные сэмплы с хэндпана (Freesound, Musical Artifacts и т.д.).

## Гамма D Kurd

```
        A4
   A3        Bb3
C4              D4
   E4    F4   G4
        Ding (D3)
```

## Разработка

```bash
zeus dev       # симулятор
zeus preview   # QR на часы
zeus build     # .zab пакет
```

## Лицензия

MIT © zeprogress
