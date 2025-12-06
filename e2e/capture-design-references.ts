/**
 * Design Reference Capture Script
 *
 * Captures screenshots, full-page scrolls, and extracts CSS/code from award-winning websites
 * for design inspiration. Results saved to design-references/ (gitignored).
 *
 * Usage:
 *   pnpm capture:design
 *   # or with specific sites:
 *   SITES="https://example.com,https://another.com" pnpm capture:design
 */

import { test } from '@playwright/test'

// Increase test timeout for slow sites
test.setTimeout(120000)
import * as fs from 'fs'
import * as path from 'path'

// Award-winning storytelling sites to capture
const DEFAULT_SITES = [
  // Awwwards storytelling examples
  'https://www.awwwards.com/websites/storytelling/',
  // Known award winners with scroll animations
  'https://www.apple.com/airpods-max/',
  'https://linear.app/',
  'https://stripe.com/sessions',
  'https://vercel.com/home',
  // Storytelling examples
  'https://www.theguardian.com/environment/ng-interactive/2024/jan/17/carbon-bombs-the-1374bn-fossil-fuel-projects-that-threaten-our-climate',
]

const OUTPUT_DIR = path.join(process.cwd(), 'design-references')

// Ensure output directory exists
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Sanitize URL to filename
function urlToFilename(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^\w.-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 100)
}

// Extract CSS from stylesheets
async function extractCSS(page: any): Promise<string[]> {
  const cssContents: string[] = []

  // Get inline styles
  const inlineStyles = await page.evaluate(() => {
    const styles: string[] = []
    document.querySelectorAll('style').forEach((el: HTMLStyleElement) => {
      if (el.textContent && el.textContent.length < 50000) {
        // Skip huge bundles
        styles.push(el.textContent)
      }
    })
    return styles
  })
  cssContents.push(...inlineStyles)

  // Get linked stylesheets (non-obfuscated)
  const stylesheetUrls = await page.evaluate(() => {
    const links: string[] = []
    document.querySelectorAll('link[rel="stylesheet"]').forEach((el: HTMLLinkElement) => {
      const href = el.href
      // Skip obvious CDN/framework bundles that are usually minified
      if (
        href &&
        !href.includes('cdn.') &&
        !href.includes('chunk') &&
        !href.includes('.min.') &&
        !href.includes('vendor')
      ) {
        links.push(href)
      }
    })
    return links
  })

  for (const url of stylesheetUrls.slice(0, 5)) {
    // Limit to 5 stylesheets
    try {
      const response = await page.request.get(url)
      const text = await response.text()
      // Skip if looks obfuscated (random class names like .a1b2c3)
      if (text && !text.match(/\.[a-z][a-z0-9]{4,8}\s*\{/g)) {
        cssContents.push(`/* Source: ${url} */\n${text}`)
      }
    } catch {
      // Ignore fetch errors
    }
  }

  return cssContents
}

// Extract interesting CSS properties for animations/effects
async function extractAnimationCSS(page: any): Promise<string> {
  return await page.evaluate(() => {
    const interestingProps = [
      'animation',
      'transition',
      'transform',
      'opacity',
      'filter',
      'clip-path',
      'mask',
      'scroll-behavior',
      'scroll-snap',
      'position: sticky',
      'position: fixed',
    ]

    const elements = document.querySelectorAll('*')
    const collected: string[] = []

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el)
      const classes = el.className
      const tagName = el.tagName.toLowerCase()

      // Check for interesting properties
      for (const prop of interestingProps) {
        if (prop.includes(':')) {
          // Check for specific value
          const [p, v] = prop.split(': ')
          if (computed.getPropertyValue(p) === v) {
            const selector = classes ? `.${classes.toString().split(' ')[0]}` : tagName
            collected.push(`/* ${selector} has ${prop} */`)
          }
        } else {
          const value = computed.getPropertyValue(prop)
          if (value && value !== 'none' && value !== '0s' && value !== 'auto') {
            const selector = classes
              ? `.${classes.toString().split(' ')[0]}`
              : `${tagName}:nth-of-type(1)`
            collected.push(`${selector} { ${prop}: ${value}; }`)
          }
        }
      }
    })

    // Dedupe and return
    return [...new Set(collected)].slice(0, 200).join('\n')
  })
}

// Capture scroll interactions by scrolling and recording state changes
async function captureScrollSequence(
  page: any,
  siteDir: string,
  siteName: string
): Promise<void> {
  const scrollDir = path.join(siteDir, 'scroll-sequence')
  ensureDir(scrollDir)

  const viewportHeight = await page.evaluate(() => window.innerHeight)
  const totalHeight = await page.evaluate(() => document.body.scrollHeight)
  const steps = Math.min(10, Math.ceil(totalHeight / viewportHeight))

  for (let i = 0; i <= steps; i++) {
    const scrollY = i * viewportHeight * 0.8 // 80% viewport per step
    await page.evaluate((y: number) => window.scrollTo(0, y), scrollY)
    await page.waitForTimeout(500) // Wait for animations

    await page.screenshot({
      path: path.join(scrollDir, `step-${String(i).padStart(2, '0')}.png`),
      fullPage: false,
    })
  }
}

test.describe('Design Reference Capture', () => {
  test('capture design references from award-winning sites', async ({ page }) => {
    ensureDir(OUTPUT_DIR)

    // Get sites from env or use defaults
    const sitesEnv = process.env.SITES
    const sites = sitesEnv ? sitesEnv.split(',') : DEFAULT_SITES

    const summary: Array<{
      url: string
      screenshots: string[]
      cssFiles: string[]
      notes: string
    }> = []

    for (const url of sites) {
      console.log(`\n📸 Capturing: ${url}`)
      const siteName = urlToFilename(url)
      const siteDir = path.join(OUTPUT_DIR, siteName)
      ensureDir(siteDir)

      try {
        // Navigate with timeout - use domcontentloaded for faster loading
        await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(3000) // Wait for JS to init and animations to start

        // 1. Viewport screenshot
        await page.screenshot({
          path: path.join(siteDir, 'viewport.png'),
          fullPage: false,
        })
        console.log('  ✓ Viewport screenshot')

        // 2. Full page screenshot
        await page.screenshot({
          path: path.join(siteDir, 'full-page.png'),
          fullPage: true,
        })
        console.log('  ✓ Full page screenshot')

        // 3. Scroll sequence
        await captureScrollSequence(page, siteDir, siteName)
        console.log('  ✓ Scroll sequence captured')

        // 4. Extract CSS
        const cssContents = await extractCSS(page)
        if (cssContents.length > 0) {
          const cssPath = path.join(siteDir, 'extracted-styles.css')
          fs.writeFileSync(cssPath, cssContents.join('\n\n/* --- */\n\n'))
          console.log(`  ✓ Extracted ${cssContents.length} CSS sources`)
        }

        // 5. Extract animation-specific CSS
        const animationCSS = await extractAnimationCSS(page)
        if (animationCSS) {
          fs.writeFileSync(path.join(siteDir, 'animation-styles.css'), animationCSS)
          console.log('  ✓ Extracted animation styles')
        }

        // 6. Save page title and meta
        const title = await page.title()
        const description = await page.evaluate(
          () => document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
        )
        fs.writeFileSync(
          path.join(siteDir, 'meta.json'),
          JSON.stringify({ url, title, description, capturedAt: new Date().toISOString() }, null, 2)
        )

        summary.push({
          url,
          screenshots: ['viewport.png', 'full-page.png', 'scroll-sequence/'],
          cssFiles: cssContents.length > 0 ? ['extracted-styles.css', 'animation-styles.css'] : [],
          notes: title,
        })
      } catch (error) {
        console.log(`  ✗ Error: ${(error as Error).message}`)
        summary.push({
          url,
          screenshots: [],
          cssFiles: [],
          notes: `Error: ${(error as Error).message}`,
        })
      }
    }

    // Write summary
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'README.md'),
      `# Design References

Captured: ${new Date().toISOString()}

## Sites

${summary
  .map(
    (s) => `### ${s.url}
- **Notes**: ${s.notes}
- **Screenshots**: ${s.screenshots.join(', ') || 'none'}
- **CSS**: ${s.cssFiles.join(', ') || 'none'}
`
  )
  .join('\n')}

## Usage

These references are for inspiration only. Do not copy code directly.
Look for:
- Scroll animation patterns
- Typography treatments
- Color transitions
- Layout innovations
- Micro-interactions
`
    )

    console.log(`\n✅ Done! References saved to ${OUTPUT_DIR}`)
  })
})
