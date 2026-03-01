'use strict';

const path = require('path');
const fs = require('fs');

const SOUNDS_DIR = path.join(__dirname, '..', 'sounds');
const AUDIO_EXTS = ['.mp3', '.wav'];

function getBundledSounds() {
  if (!fs.existsSync(SOUNDS_DIR)) return [];
  return fs.readdirSync(SOUNDS_DIR)
    .filter(f => AUDIO_EXTS.includes(path.extname(f).toLowerCase()))
    .sort()
    .map(f => ({ title: f, value: path.join(SOUNDS_DIR, f) }));
}

module.exports = { getBundledSounds, SOUNDS_DIR };
