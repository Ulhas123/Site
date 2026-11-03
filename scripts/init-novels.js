#!/usr/bin/env node
/**
 * Node.js wrapper for Novel Initializer.
 * Executes python scripts/init_novels.py passing through all CLI arguments.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, 'init_novels.py');

const args = process.argv.slice(2);
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

const child = spawn(pythonCmd, [scriptPath, ...args], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
