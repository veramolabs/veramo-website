#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'glob'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPORT_MODE = process.argv.includes('--report')
const VERBOSE = process.argv.includes('--verbose')

// Determine repository root (one level up from this script's directory)
const repoRoot = path.resolve(__dirname, '..')

// Define paths
const docsGlob = 'docs/**/*.{md,mdx}'
const tmpDir = path.join(repoRoot, 'temp/codeblocks')
const reportFile = path.join(repoRoot, 'baseline-report.md')

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
}

// Find all markdown files relative to repo root
const allMdFiles = globSync(docsGlob, { cwd: repoRoot, absolute: false })

// Exclude auto-generated API docs
const mdFiles = allMdFiles.filter((file) => !file.startsWith('docs/api/'))

// Process each file
const results: [string, number, string, string][] = []
const detailedErrors = new Map<string, { blockIndex: number; error: string }[]>()

for (const mdFile of mdFiles) {
  const content = fs.readFileSync(path.join(repoRoot, mdFile), 'utf-8')
  const codeBlockRegex = /```(ts|typescript)\n([\s\S]+?)\n```/g
  let match
  let blockIndex = 0

  // docDir: a scratch directory scoped to this markdown file, acts as the project root
  const docBaseName = path.basename(mdFile, path.extname(mdFile))
  const docDir = path.join(tmpDir, docBaseName)
  if (fs.existsSync(docDir)) fs.rmSync(docDir, { recursive: true })
  fs.mkdirSync(docDir, { recursive: true })

  /**
   * Virtual file tree: maps virtual filename (e.g. "src/veramo/setup.ts") to
   * the accumulated source code written so far for that file.
   */
  const virtualFiles = new Map<string, string>()

  /**
   * Fallback accumulator for blocks that have no // filename: comment.
   * They get merged into a single anonymous file as before.
   */
  const unnamedBlocks: string[] = []

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[2]

    // --- Detect // filename: comment (first line of the block) ---
    const firstLine = code.split('\n')[0].trim()
    const filenameMatch = firstLine.match(/^\/\/\s*filename:\s*(.+)$/)
    const virtualFilename = filenameMatch ? filenameMatch[1].trim() : null

    if (virtualFilename) {
      // Append this block's code (strip the filename comment line) to the virtual file
      const codeWithoutComment = code.split('\n').slice(1).join('\n')
      const existing = virtualFiles.get(virtualFilename) ?? ''
      virtualFiles.set(virtualFilename, existing + (existing ? '\n' : '') + codeWithoutComment)

      // Write ALL current virtual files to docDir so imports resolve
      for (const [vPath, vCode] of virtualFiles) {
        const absPath = path.join(docDir, vPath)
        fs.mkdirSync(path.dirname(absPath), { recursive: true })
        fs.writeFileSync(absPath, vCode)
      }

      // The file being checked is the one that was just updated
      const targetFile = path.join(docDir, virtualFilename)

      try {
        execSync(
          `tsc --noEmit --skipLibCheck --target esnext --module esnext --moduleResolution bundler ${targetFile}`,
          { stdio: 'pipe', encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
        )
        results.push([mdFile, blockIndex, 'Pass', ''])
      } catch (error: any) {
        let output = ''
        if (error.stdout) output += error.stdout
        if (error.stderr) output += error.stderr
        if (!output && error.message) output = error.message
        output = output.trim()
        results.push([mdFile, blockIndex, 'Fail', output])
        if (!detailedErrors.has(mdFile)) detailedErrors.set(mdFile, [])
        detailedErrors.get(mdFile)!.push({ blockIndex, error: output })
      }
    } else {
      // No filename comment — fall back to the flat accumulation approach
      unnamedBlocks.push(code)
      const merged = mergeBlocks(unnamedBlocks)
      const tempFile = path.join(tmpDir, `${docBaseName}_block${blockIndex}.ts`)
      fs.writeFileSync(tempFile, merged)

      try {
        execSync(
          `tsc --noEmit --skipLibCheck --target esnext --module esnext --moduleResolution bundler ${tempFile}`,
          { stdio: 'pipe', encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
        )
        results.push([mdFile, blockIndex, 'Pass', ''])
      } catch (error: any) {
        let output = ''
        if (error.stdout) output += error.stdout
        if (error.stderr) output += error.stderr
        if (!output && error.message) output = error.message
        output = output.trim()
        results.push([mdFile, blockIndex, 'Fail', output])
        if (!detailedErrors.has(mdFile)) detailedErrors.set(mdFile, [])
        detailedErrors.get(mdFile)!.push({ blockIndex, error: output })
      }
    }

    blockIndex++
  }
}

/**
 * Merge multiple TypeScript code blocks into a single compilable file.
 * Used as a fallback for blocks without a // filename: comment.
 */
function mergeBlocks(blocks: string[]): string {
  const seenImports = new Set<string>()
  const imports: string[] = []
  const bodies: string[] = []

  for (const block of blocks) {
    const lines = block.split('\n')
    const bodyLines: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (/^import[\s{*("']/.test(trimmed)) {
        if (!seenImports.has(line)) {
          seenImports.add(line)
          imports.push(line)
        }
      } else {
        bodyLines.push(line)
      }
    }

    const bodyText = bodyLines.join('\n').trim()
    if (bodyText) bodies.push(bodyText)
  }

  return [...imports, '', ...bodies].join('\n')
}

// Generate markdown table
let table = '| File Path | Block Index | Result | Errors |\n|-----------|-------------|--------|--------|\n'
results.forEach(([file, index, result, errors]) => {
  const errorDisplay = errors.replace(/\|/g, '\\|').replace(/\n/g, ' ')
  table += `| ${file} | ${index} | ${result} | ${errorDisplay} |\n`
})

console.log(table)

if (VERBOSE && detailedErrors.size > 0) {
  console.log('\n### DETAILED ERRORS ###\n')
  detailedErrors.forEach((errors, file) => {
    console.log(`\n${file}\n`)
    errors.forEach(({ blockIndex, error }) => {
      console.log(`  Block ${blockIndex}:`)
      console.log(`  ${error}\n`)
    })
  })
}

if (REPORT_MODE) {
  fs.writeFileSync(reportFile, table)
  console.log(`Report saved to ${reportFile}`)
}
