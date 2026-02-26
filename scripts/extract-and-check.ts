#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'glob'
import { execFileSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPORT_MODE = process.argv.includes('--report')

const repoRoot = path.resolve(__dirname, '..')
const tmpDir = path.join(repoRoot, 'temp/codeblocks')
const reportFile = path.join(repoRoot, 'baseline-report.md')

const TSC_FLAGS = [
  '--noEmit',
  '--skipLibCheck',
  '--target',
  'esnext',
  '--module',
  'esnext',
  '--moduleResolution',
  'bundler',
]
const CODE_BLOCK_RE = /```(ts|typescript)\n([\s\S]+?)\n```/gi
const FILENAME_RE = /^\/\/\s*filename:\s*(.+)$/

type CheckResult = { file: string; blockIndex: number; passed: boolean; error: string }

/** Returns null on success, trimmed error string on failure. */
function typecheck(targetFile: string): string | null {
  try {
    execFileSync('tsc', [...TSC_FLAGS, targetFile], {
      stdio: 'pipe',
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    })
    return null
  } catch (err: any) {
    return (((err.stdout ?? '') + (err.stderr ?? '')).trim() || err.message).trim()
  }
}

/**
 * Returns true when virtualFilename is safe to use as a file path inside docDir.
 * Rejects traversal sequences, directory-only paths (trailing separator or "."), and
 * anything that resolves to docDir itself.
 */
function isSafeVirtualFilename(docDir: string, virtualFilename: string): boolean {
  if (virtualFilename.endsWith('/') || virtualFilename.endsWith(path.sep)) return false
  const rel = path.relative(docDir, path.resolve(docDir, virtualFilename))
  return rel !== '' && !rel.startsWith('..')
}

/**
 * Merge multiple TypeScript code blocks into a single compilable file.
 * Used as a fallback for blocks without a // filename: comment.
 */
function mergeBlocks(blocks: string[]): string {
  const isImport = (line: string) => /^import[\s{*("']/.test(line.trim())
  const imports = [...new Set(blocks.flatMap((b) => b.split('\n').filter(isImport)))]
  const bodies = blocks
    .map((b) =>
      b
        .split('\n')
        .filter((l) => !isImport(l))
        .join('\n')
        .trim(),
    )
    .filter(Boolean)
  return [...imports, '', ...bodies].join('\n')
}

fs.mkdirSync(tmpDir, { recursive: true })

const mdFiles = globSync('docs/**/*.{md,mdx}', { cwd: repoRoot, absolute: false }).filter(
  (f) => !f.startsWith('docs/api/'),
)

const results: CheckResult[] = []

for (const mdFile of mdFiles) {
  const content = fs.readFileSync(path.join(repoRoot, mdFile), 'utf-8')
  const docBaseName = path.basename(mdFile, path.extname(mdFile))
  const docDir = path.join(tmpDir, docBaseName)

  fs.rmSync(docDir, { recursive: true, force: true })
  fs.mkdirSync(docDir, { recursive: true })

  const virtualFiles = new Map<string, string>()
  const unnamedBlocks: string[] = []

  for (const [blockIndex, match] of [...content.matchAll(CODE_BLOCK_RE)].entries()) {
    const code = match[2]
    const lines = code.split('\n')
    const filenameMatch = lines[0].trim().match(FILENAME_RE)
    const virtualFilename = filenameMatch?.[1].trim() ?? null

    let targetFile: string

    if (virtualFilename) {
      if (!isSafeVirtualFilename(docDir, virtualFilename)) {
        results.push({
          file: mdFile,
          blockIndex,
          passed: false,
          error: `unsafe filename: ${virtualFilename}`,
        })
        continue
      }

      const codeWithoutComment = lines.slice(1).join('\n')
      const existing = virtualFiles.get(virtualFilename) ?? ''
      virtualFiles.set(virtualFilename, existing ? `${existing}\n${codeWithoutComment}` : codeWithoutComment)

      targetFile = path.join(docDir, virtualFilename)
      fs.mkdirSync(path.dirname(targetFile), { recursive: true })
      fs.writeFileSync(targetFile, virtualFiles.get(virtualFilename)!)
    } else {
      unnamedBlocks.push(code)
      targetFile = path.join(tmpDir, `${docBaseName}_block${blockIndex}.ts`)
      fs.writeFileSync(targetFile, mergeBlocks(unnamedBlocks))
    }

    const error = typecheck(targetFile)
    results.push({ file: mdFile, blockIndex, passed: error === null, error: error ?? '' })
  }
}

const table =
  [
    '| File Path | Block Index | Result | Errors |',
    '|-----------|-------------|--------|--------|',
    ...results.map(({ file, blockIndex, passed, error }) => {
      const errorDisplay = error.replace(/\|/g, '\\|').replace(/\n/g, ' ')
      return `| ${file} | ${blockIndex} | ${passed ? 'Pass' : 'Fail'} | ${errorDisplay} |`
    }),
  ].join('\n') + '\n'

console.log(table)

if (REPORT_MODE) {
  fs.writeFileSync(reportFile, table)
  console.log(`Report saved to ${reportFile}`)
}
