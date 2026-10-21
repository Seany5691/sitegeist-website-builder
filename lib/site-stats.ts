/**
 * Single source of truth for site statistics.
 * Every component (Hero, About, StatsBar) MUST use getSiteStats(config).
 * Never hardcode fallback stats — they contradict each other across pages.
 */

export interface SiteStat {
  value: string
  label: string
}

/**
 * Get the site's stats from one place.
 * Priority: config.stats array → hero.statNValue/Label pairs.
 * Returns [] when nothing is configured — components should hide, not invent.
 */
export function getSiteStats(config: any): SiteStat[] {
  if (!config) return []

  // 1. Preferred: config.stats array (written by the build / dashboard)
  if (Array.isArray(config.stats) && config.stats.length > 0) {
    return config.stats
      .filter((s: any) => s && (s.value || s.label))
      .map((s: any) => ({
        value: String(s.value ?? ''),
        label: String(s.label ?? ''),
      }))
  }

  // 2. Fallback: hero stat slots (same values, so pages stay consistent)
  const hero = config.hero || {}
  const pairs: Array<[string, string, string]> = [
    [hero.stat1Value, hero.stat1Label, ''],
    [hero.stat2Value, hero.stat2Label, ''],
    [hero.stat3Value, hero.stat3Label, ''],
    [hero.stat4Value, hero.stat4Label, ''],
  ]
  const out: SiteStat[] = []
  for (const [value, label] of pairs) {
    if (value && label) out.push({ value: String(value), label: String(label) })
    else if (value) out.push({ value: String(value), label: '' })
  }
  return out
}

/**
 * Format a stat value + unit for display.
 * Avoids "374min" — splits number from unit for proper typography.
 */
export function formatStatDisplay(value: string): { number: string; unit: string } {
  const m = String(value).match(/^([\d.,]+)\s*(.*)$/)
  if (m) return { number: m[1], unit: m[2] }
  return { number: String(value), unit: '' }
}
