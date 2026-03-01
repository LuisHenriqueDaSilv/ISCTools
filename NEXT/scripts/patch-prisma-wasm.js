#!/usr/bin/env node
/**
 * Patch Prisma generated client: replace query_compiler_bg with query_compiler_fast_bg
 * so imports resolve against @prisma/client (which only exposes fast/small variants).
 * Run after `prisma generate` (e.g. npm run generate).
 */
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'app', 'generated', 'prisma', 'internal', 'class.ts');
if (!fs.existsSync(file)) {
  console.warn('patch-prisma-wasm: file not found', file);
  process.exit(0);
}
let content = fs.readFileSync(file, 'utf8');
const before = content;
content = content.replace(
  /@prisma\/client\/runtime\/query_compiler_bg\.postgresql\./g,
  '@prisma/client/runtime/query_compiler_fast_bg.postgresql.'
);
if (content === before) {
  console.warn('patch-prisma-wasm: no replacements made (already patched or format changed?)');
} else {
  fs.writeFileSync(file, content);
  console.log('patch-prisma-wasm: patched', file);
}
