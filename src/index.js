'use strict';

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const chalk = require('chalk');
const { preview, stopPreview } = require('./audio');
const { getBundledSounds } = require('./sounds');
const { writeConfig } = require('./config');

function printHeader() {
  console.log('');
  console.log(chalk.cyan('  ╔═══════════════════════════════════════════╗'));
  console.log(chalk.cyan('  ║') + chalk.bold('     Claude Code Notification Sounds       ') + chalk.cyan('║'));
  console.log(chalk.cyan('  ╚═══════════════════════════════════════════╝'));
  console.log('');
  console.log('  Configure audio for two events:');
  console.log('    ' + chalk.yellow('1. Task Complete') + '  — plays when Claude finishes');
  console.log('    ' + chalk.yellow('2. Input Prompt') + '   — plays when Claude needs your input');
  console.log('');
  console.log('  ' + chalk.dim('─────────────────────────────────────────────'));
  console.log('');
}

async function pickSound(eventLabel) {
  const bundled = getBundledSounds();

  if (bundled.length === 0) {
    console.log(chalk.yellow(`  No bundled sounds found in the sounds/ directory.`));
    console.log(chalk.dim(`  You can add OGG, MP3, or WAV files to: ${path.join(__dirname, '..', 'sounds')}`));
    console.log('');
  }

  const choices = [
    ...bundled,
    ...(bundled.length > 0
      ? [{ title: chalk.dim('─────────────────'), value: null, disabled: true }]
      : []),
    { title: 'Browse local file...', value: 'LOCAL' },
    { title: chalk.dim('None / skip'), value: 'NONE' },
  ];

  console.log(chalk.bold(`  ▶ ${eventLabel} sound:`));
  console.log('');

  const response = await prompts({
    type: 'select',
    name: 'sound',
    message: `${eventLabel} sound`,
    choices,
    onState(state) {
      const val = state.value;
      if (val && val !== 'LOCAL' && val !== 'NONE') {
        preview(val);
      } else {
        stopPreview();
      }
    },
  });

  stopPreview();

  // User cancelled (Ctrl+C)
  if (response.sound === undefined) {
    console.log(chalk.yellow('\n  Cancelled.'));
    process.exit(0);
  }

  if (response.sound === 'NONE') {
    return null;
  }

  if (response.sound === 'LOCAL') {
    console.log('');
    const localResponse = await prompts({
      type: 'text',
      name: 'localPath',
      message: 'Enter full path to audio file',
      validate: (p) => {
        const expanded = p.replace(/^~/, process.env.HOME || '');
        return fs.existsSync(expanded) ? true : 'File not found';
      },
    });

    if (localResponse.localPath === undefined) {
      console.log(chalk.yellow('\n  Cancelled.'));
      process.exit(0);
    }

    return localResponse.localPath.replace(/^~/, process.env.HOME || '');
  }

  return response.sound;
}

async function main() {
  printHeader();

  const completeSound = await pickSound('Task Complete');
  console.log('');
  console.log('  ' + chalk.dim('─────────────────────────────────────────────'));
  console.log('');

  const promptSound = await pickSound('Input Prompt');
  console.log('');
  console.log('  ' + chalk.dim('─────────────────────────────────────────────'));
  console.log('');

  // Summary
  const soundLabel = (s) => s ? chalk.green(path.basename(s)) : chalk.dim('(none)');
  console.log('  ' + chalk.green('✓') + ' Task Complete  →  ' + soundLabel(completeSound));
  console.log('  ' + chalk.green('✓') + ' Input Prompt   →  ' + soundLabel(promptSound));
  console.log('');

  if (!completeSound && !promptSound) {
    console.log(chalk.yellow('  No sounds selected. Nothing written.'));
    console.log('');
    return;
  }

  // Use a placeholder path if one is skipped (won't play, notify.sh handles missing files)
  const effectiveComplete = completeSound || '/dev/null';
  const effectivePrompt = promptSound || '/dev/null';

  process.stdout.write('  Writing ~/.claude/notify.sh ...     ');
  try {
    const { notifySh, settingsJson } = writeConfig(effectiveComplete, effectivePrompt);
    console.log(chalk.green('✓'));
    process.stdout.write('  Writing ~/.claude/settings.json ... ');
    console.log(chalk.green('✓'));
    console.log('');
    console.log('  ' + chalk.bold('Restart Claude Code to apply changes.'));
    console.log('');
    console.log(chalk.dim(`  notify.sh:    ${notifySh}`));
    console.log(chalk.dim(`  settings.json: ${settingsJson}`));
  } catch (err) {
    console.log(chalk.red('✗'));
    console.error(chalk.red(`  Error: ${err.message}`));
    process.exit(1);
  }

  console.log('');
}

main().catch((err) => {
  console.error(chalk.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});
