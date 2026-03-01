'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const NOTIFY_SH = path.join(CLAUDE_DIR, 'notify.sh');
const SETTINGS_JSON = path.join(CLAUDE_DIR, 'settings.json');

const NOTIFY_SH_CONTENT = `#!/usr/bin/env bash
FILE="$1"
[ -z "$FILE" ] || [ ! -f "$FILE" ] && exit 0
if command -v ffplay >/dev/null 2>&1; then
  ffplay -nodisp -autoexit -loglevel quiet "$FILE" 2>/dev/null && exit 0
fi
if command -v afplay >/dev/null 2>&1; then
  afplay "$FILE" 2>/dev/null && exit 0
fi
if command -v paplay >/dev/null 2>&1; then
  paplay "$FILE" 2>/dev/null && exit 0
fi
if command -v aplay >/dev/null 2>&1; then
  aplay -q "$FILE" 2>/dev/null && exit 0
fi
printf '\\a'
exit 0
`;

function writeNotifySh() {
  if (!fs.existsSync(CLAUDE_DIR)) {
    fs.mkdirSync(CLAUDE_DIR, { recursive: true });
  }
  fs.writeFileSync(NOTIFY_SH, NOTIFY_SH_CONTENT, 'utf8');
  fs.chmodSync(NOTIFY_SH, 0o755);
}

function buildHooks(completeSound, promptSound) {
  const cmd = (soundPath) => `${NOTIFY_SH} ${soundPath}`;

  return {
    Stop: [
      {
        hooks: [
          { type: 'command', command: cmd(completeSound) }
        ]
      }
    ],
    Notification: [
      {
        matcher: 'idle_prompt',
        hooks: [
          { type: 'command', command: cmd(promptSound) }
        ]
      },
      {
        matcher: 'permission_prompt',
        hooks: [
          { type: 'command', command: cmd(promptSound) }
        ]
      }
    ]
  };
}

function writeSettings(completeSound, promptSound) {
  let existing = {};
  if (fs.existsSync(SETTINGS_JSON)) {
    try {
      existing = JSON.parse(fs.readFileSync(SETTINGS_JSON, 'utf8'));
    } catch {
      // If file is invalid JSON, start fresh but preserve file
    }
  }

  existing.hooks = buildHooks(completeSound, promptSound);

  fs.writeFileSync(SETTINGS_JSON, JSON.stringify(existing, null, 2) + '\n', 'utf8');
}

function writeConfig(completeSound, promptSound) {
  writeNotifySh();
  writeSettings(completeSound, promptSound);
  return { notifySh: NOTIFY_SH, settingsJson: SETTINGS_JSON };
}

module.exports = { writeConfig, NOTIFY_SH, SETTINGS_JSON };
