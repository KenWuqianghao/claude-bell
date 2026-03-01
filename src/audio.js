'use strict';

const player = require('play-sound')({});
let currentPlayback = null;

function preview(filePath) {
  if (currentPlayback) {
    currentPlayback.kill();
    currentPlayback = null;
  }
  if (!filePath) return;
  currentPlayback = player.play(filePath, (err) => {
    if (err && !err.killed) {
      // Ignore audio errors silently during preview
    }
  });
}

function stopPreview() {
  if (currentPlayback) {
    currentPlayback.kill();
    currentPlayback = null;
  }
}

module.exports = { preview, stopPreview };
