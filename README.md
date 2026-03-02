# claude-bell

[![npm version](https://img.shields.io/npm/v/claude-bell)](https://www.npmjs.com/package/claude-bell)
[![npm downloads](https://img.shields.io/npm/dm/claude-bell)](https://www.npmjs.com/package/claude-bell)
[![GitHub stars](https://img.shields.io/github/stars/KenWuqianghao/claude-bell)](https://github.com/KenWuqianghao/claude-bell/stargazers)
[![GitHub license](https://img.shields.io/github/license/KenWuqianghao/claude-bell)](https://github.com/KenWuqianghao/claude-bell/blob/master/LICENSE)
[![Node.js](https://img.shields.io/node/v/claude-bell)](https://nodejs.org)

Interactive CLI to configure audio notifications for [Claude Code](https://claude.ai/code).

Pick sounds for two events with a real-time audio preview as you navigate — hear each sound the moment your cursor lands on it.

## Install

```bash
npm install -g claude-bell
```

## Usage

```bash
claude-bell
```

Navigate with arrow keys. Each sound plays instantly as you highlight it. Press Enter to select.

```
  ╔═══════════════════════════════════════════╗
  ║     Claude Code Notification Sounds       ║
  ╚═══════════════════════════════════════════╝

  ▶ Task Complete sound:

  ❯ Bell - Classic        ← plays as cursor lands here
    Bell - Soft
    Elden Ring - Bell
    Elden Ring - New Item
    Hades - Boon
    Mario - Coin
    Red Alert 2 - Unit Ready
    Zelda - Korok
    Zelda - Notification
    Zelda - Pick Up
    ─────────────────
    Browse local file...
    None / skip
```

Two events are configured separately:

| Event | When it plays |
|---|---|
| **Task Complete** | Claude finishes a response |
| **Input Prompt** | Claude is waiting for your input (idle or permission prompt) |

After selecting, two files are written automatically:

- `~/.claude/notify.sh` — shell script that plays the audio
- `~/.claude/settings.json` — Claude Code hook configuration

Restart Claude Code to apply changes.

## Bundled Sounds

10 sounds included out of the box:

- Bell - Classic
- Bell - Soft
- Elden Ring - Bell
- Elden Ring - New Item
- Hades - Boon
- Mario - Coin
- Red Alert 2 - Unit Ready
- Zelda - Korok
- Zelda - Notification
- Zelda - Pick Up

## Custom Sounds

Select **Browse local file...** in the picker to use any MP3 or WAV file on your system.

## Audio Playback

`notify.sh` tries the following players in order, using whichever is available:

| Player | Platform | Formats |
|---|---|---|
| `ffplay` (ffmpeg) | Linux & macOS | MP3, WAV, and more |
| `afplay` | macOS built-in | MP3, WAV, and more |
| `mpv` | Linux & macOS | MP3, WAV, and more |
| `paplay` | Linux (PulseAudio) | WAV only |
| `aplay` | Linux (ALSA) | WAV only |
| terminal bell | fallback | n/a |

No extra dependencies required on macOS. On Linux, install `ffmpeg` or `mpv` for MP3 support. `paplay` and `aplay` are used only for WAV files to avoid distortion.

## Requirements

- Node.js 14+
- Claude Code
